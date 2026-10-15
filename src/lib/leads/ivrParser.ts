/**
 * Parsing and auto-scoring engine for IVR telecalling campaign reports (e.g. report (6).csv).
 */

export interface AdvisorProfile {
  id: string;
  full_name: string;
  phone?: string | null;
}

export interface ParsedIvrRecord {
  customer_phone: string;
  agent_number: string;
  agent_name: string;
  dial_time: string;
  customer_ans_time: string | null;
  customer_hang_time: string | null;
  call_duration: number;
  dial_status: 'ANSWER' | 'NOANSWER';
  pressed_key: string | null;
  temperature: 'hot' | 'warm' | 'cold';
  recording_url?: string | null;
  raw_payload?: Record<string, unknown> | null;
}

/**
 * Normalizes input phone strings to standard 10-digit Indian numbers.
 */
export function cleanPhoneNumber(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');

  // If prefixed with 91 and 12 digits total, take last 10
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  // If prefixed with 0 and 11 digits, take last 10
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  // Standard 10 digit number
  if (digits.length === 10) {
    return digits;
  }
  return digits;
}
/**
 * Normalizes customer phone and dial timestamp into a canonical comparison key.
 * Strips 'T', timezone offsets (+00:00, Z), and millisecond precision,
 * producing: `<10_digit_phone>_<YYYY-MM-DD HH:mm:ss>`
 */
export function normalizeCallKey(phone: string, dialTime: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const normalizedTime = (dialTime || '')
    .replace('T', ' ')
    .replace(/\+.*$/, '')
    .replace(/Z$/, '')
    .replace(/\.\d+$/, '')
    .trim();
  return `${cleanPhone}_${normalizedTime}`;
}

/**
 * Calculates lead temperature based on call duration and pressed key:
 * - Hot: duration >= 60s OR pressed key '1'
 * - Warm: duration between 20s and 59s
 * - Cold: duration < 20s without key 1
 */
export function calculateLeadTemperature(
  durationSeconds: number,
  pressedKey?: string | null
): 'hot' | 'warm' | 'cold' {
  const cleanKey = pressedKey ? String(pressedKey).trim() : '';

  if (cleanKey === '1' || durationSeconds >= 60) {
    return 'hot';
  }
  if (durationSeconds >= 20 && durationSeconds < 60) {
    return 'warm';
  }
  return 'cold';
}

/**
 * Resolves an assigned employee profile ID from the CSV agent name and phone number.
 */
export function resolveAdvisorId(
  agentName: string,
  agentPhone: string,
  profiles: AdvisorProfile[]
): string | null {
  const normAgentName = agentName.trim().toLowerCase();
  const normAgentPhone = cleanPhoneNumber(agentPhone);

  // 1. Exact or case-insensitive name match
  const nameMatch = profiles.find((p) => {
    const pName = p.full_name.trim().toLowerCase();
    return (
      pName === normAgentName || pName.includes(normAgentName) || normAgentName.includes(pName)
    );
  });
  if (nameMatch) return nameMatch.id;

  // 2. Exact phone match
  if (normAgentPhone) {
    const phoneMatch = profiles.find((p) => {
      if (!p.phone) return false;
      return cleanPhoneNumber(p.phone) === normAgentPhone;
    });
    if (phoneMatch) return phoneMatch.id;
  }

  // 3. Known agent aliases
  const aliasMap: Record<string, string[]> = {
    deepa: ['deepa', 'deepa sharma'],
    ruby: ['ruby'],
    riya: ['riya'],
    arbaaz: ['arbaaz', 'arwaz'],
    khushbu: ['khushbu', 'khusboo', 'kushbo'],
    ananya: ['ananya', 'anaya'],
    shubham: ['shubham'],
    raghvendra: ['raghvendra', 'ragvendra'],
    gaurav: ['gaurav', 'gagan', 'ganga'],
    javed: ['javed'],
    luv: ['luv'],
    piyush: ['piyush'],
    prateek: ['prateek', 'prteek'],
    suhan: ['suhan'],
    aryan: ['aryan'],
    dheeraj: ['dheeraj', 'dhiraj'],
    deepak: ['deepak'],
    santosh: ['santosh'],
    shashank: ['shashank'],
    shivam: ['shivam'],
    shikha: ['shikha', 'shikha tomer', 'shikha tomar'],
    khushi: ['khushi', 'khushi pal', 'khushi chodhary'],
    manish: ['manish', 'manish sharma'],
    soniya: ['soniya', 'sonia', 'sonia garg', 'soniya garg'],
    kajal: ['kajal', 'kajal singh', 'kajal vishu'],
    abhishek: ['abhishek', 'abhishek singh', 'abhishek kumar'],
    amarnath: ['amarnath', 'amarnath sharma'],
    vinod: ['vinod', 'vinod ji'],
    wasi: ['wasi', 'haider wasi', 'wasi haider'],
    rashmi: ['rashmi', 'rashmi shakya'],
  };

  for (const [keyName, aliases] of Object.entries(aliasMap)) {
    if (aliases.some((alias) => normAgentName.includes(alias))) {
      const match = profiles.find((p) => p.full_name.toLowerCase().includes(keyName));
      if (match) return match.id;
    }
  }

  return null;
}

/**
 * Tokenizes one CSV line respecting quoted strings.
 */
export function tokenizeCsvLine(line: string): string[] {
  const res: string[] = [];
  let inQuote = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuote = !inQuote;
    } else if (c === ',' && !inQuote) {
      res.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  res.push(cur.trim());
  return res.map((cell) => cell.replace(/^["']|["']$/g, '').trim());
}

/**
 * Parses raw IVR CSV content into structured records.
 */
export function parseIvrCsvText(csvContent: string): ParsedIvrRecord[] {
  if (!csvContent || !csvContent.trim()) return [];

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const records: ParsedIvrRecord[] = [];

  // Determine column index map from header (cleaned of quotes)
  const header = tokenizeCsvLine(lines[0]).map((h) => h.toLowerCase());
  const numIdx = header.findIndex(
    (h) =>
      h === 'number' ||
      h === 'from number' ||
      h === 'from_number' ||
      h.includes('phone') ||
      h.includes('customer') ||
      h.includes('caller')
  );
  const agentNumIdx = header.findIndex(
    (h) =>
      h === 'agentnumber' ||
      h === 'to number' ||
      h === 'to_number' ||
      h.includes('agent phone') ||
      h.includes('agent_number')
  );
  const agentNameIdx = header.findIndex(
    (h) =>
      h === 'agentname' ||
      h === 'user' ||
      h.includes('agent name') ||
      h.includes('agent_name') ||
      h.includes('advisor')
  );
  const dialTimeIdx = header.findIndex(
    (h) =>
      h === 'dialtime' ||
      h === 'start time' ||
      h === 'start_time' ||
      h.includes('dial time') ||
      h.includes('dial_time')
  );
  const ansTimeIdx = header.findIndex(
    (h) =>
      h === 'customeranstime' ||
      h === 'answer time' ||
      h === 'answer_time' ||
      h.includes('ans time') ||
      h.includes('anstime')
  );
  const hangTimeIdx = header.findIndex(
    (h) =>
      h === 'custhangtime' ||
      h === 'end time' ||
      h === 'end_time' ||
      h.includes('hang time') ||
      h.includes('hangtime')
  );
  const durationIdx = header.findIndex((h) => h === 'call duration' || h.includes('duration'));
  const statusIdx = header.findIndex(
    (h) =>
      h === 'dialstatus' ||
      h === 'dail status' ||
      h === 'dailstatus' ||
      h.includes('dialstatus') ||
      h.includes('dial status') ||
      h.includes('status')
  );
  const keyIdx = header.findIndex((h) => h === 'pressedkey' || h.includes('key'));
  const recordingIdx = header.findIndex((h) => h === 'recording' || h.includes('recording'));
  const pulseIdx = header.findIndex((h) => h === 'pulse');
  const virtualNumIdx = header.findIndex((h) => h === 'virtual number' || h === 'virtual_number');

  for (let i = 1; i < lines.length; i++) {
    const row = tokenizeCsvLine(lines[i]);
    if (row.length < 3) continue;

    const rawCustomerPhone = row[numIdx >= 0 ? numIdx : 0] || '';
    const customerPhone = cleanPhoneNumber(rawCustomerPhone);
    if (!customerPhone) continue;

    const agentNumber = row[agentNumIdx >= 0 ? agentNumIdx : 1] || '';
    const agentName = row[agentNameIdx >= 0 ? agentNameIdx : 2] || 'Unassigned';
    const dialTime = row[dialTimeIdx >= 0 ? dialTimeIdx : 3] || new Date().toISOString();

    const rawAnsTime = ansTimeIdx >= 0 ? row[ansTimeIdx] : null;
    const customerAnsTime =
      rawAnsTime && rawAnsTime !== 'NA' && !rawAnsTime.startsWith('0000-00-00') ? rawAnsTime : null;

    const rawHangTime = hangTimeIdx >= 0 ? row[hangTimeIdx] : null;
    const customerHangTime =
      rawHangTime && rawHangTime !== 'NA' && !rawHangTime.startsWith('0000-00-00')
        ? rawHangTime
        : null;

    const rawDuration = durationIdx >= 0 ? parseInt(row[durationIdx], 10) : 0;
    const callDuration = isNaN(rawDuration) ? 0 : Math.max(0, rawDuration);

    const rawStatus = (statusIdx >= 0 ? row[statusIdx] : 'NOANSWER').toUpperCase();
    const dialStatus: 'ANSWER' | 'NOANSWER' =
      rawStatus === 'ANSWER' || rawStatus === 'ANSWERED' ? 'ANSWER' : 'NOANSWER';

    const rawKey = keyIdx >= 0 && row[keyIdx] ? row[keyIdx] : null;
    const pressedKey = rawKey && rawKey !== '' && rawKey !== 'NA' ? rawKey : null;

    const temperature = calculateLeadTemperature(callDuration, pressedKey);

    const rawRecording = recordingIdx >= 0 ? row[recordingIdx] : null;
    const recordingUrl =
      rawRecording &&
      rawRecording !== 'NA' &&
      !rawRecording.includes('0000-00-00') &&
      rawRecording.startsWith('http')
        ? rawRecording
        : null;

    const rawPulse = pulseIdx >= 0 ? parseInt(row[pulseIdx], 10) : undefined;
    const virtualNum = virtualNumIdx >= 0 ? row[virtualNumIdx] : undefined;

    const rawPayload: Record<string, unknown> = {};
    if (recordingUrl) rawPayload.recording_url = recordingUrl;
    if (rawPulse !== undefined && !isNaN(rawPulse)) rawPayload.pulse = rawPulse;
    if (virtualNum) rawPayload.virtual_number = virtualNum;
    if (recordingUrl || (rawPulse !== undefined && !isNaN(rawPulse)) || virtualNum) {
      if (rawStatus) rawPayload.status = rawStatus;
    }
    records.push({
      customer_phone: customerPhone,
      agent_number: agentNumber,
      agent_name: agentName,
      dial_time: dialTime,
      customer_ans_time: customerAnsTime,
      customer_hang_time: customerHangTime,
      call_duration: callDuration,
      dial_status: dialStatus,
      pressed_key: pressedKey,
      temperature,
      recording_url: recordingUrl,
      raw_payload: Object.keys(rawPayload).length > 0 ? rawPayload : null,
    });
  }

  return records;
}
