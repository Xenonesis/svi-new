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
  if (normAgentName.includes('shivam')) {
    const shivam = profiles.find((p) => p.full_name.toLowerCase().includes('shivam'));
    if (shivam) return shivam.id;
  }
  if (normAgentName.includes('shikha')) {
    const shikha = profiles.find((p) => p.full_name.toLowerCase().includes('shikha'));
    if (shikha) return shikha.id;
  }
  if (normAgentName.includes('khushi')) {
    const khushi = profiles.find((p) => p.full_name.toLowerCase().includes('khushi'));
    if (khushi) return khushi.id;
  }
  if (normAgentName.includes('manish')) {
    const manish = profiles.find((p) => p.full_name.toLowerCase().includes('manish'));
    if (manish) return manish.id;
  }
  if (normAgentName.includes('soniya')) {
    const soniya = profiles.find((p) => p.full_name.toLowerCase().includes('soniya'));
    if (soniya) return soniya.id;
  }
  if (normAgentName.includes('kajal')) {
    const kajal = profiles.find((p) => p.full_name.toLowerCase().includes('kajal'));
    if (kajal) return kajal.id;
  }

  return null;
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

  // Determine column index map from header
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const numIdx = header.findIndex(
    (h) => h === 'number' || h.includes('phone') || h.includes('customer')
  );
  const agentNumIdx = header.findIndex(
    (h) => h === 'agentnumber' || h.includes('agent phone') || h.includes('agent_number')
  );
  const agentNameIdx = header.findIndex(
    (h) => h === 'agentname' || h.includes('agent name') || h.includes('agent_name')
  );
  const dialTimeIdx = header.findIndex(
    (h) => h === 'dialtime' || h.includes('dial time') || h.includes('dial_time')
  );
  const ansTimeIdx = header.findIndex(
    (h) => h === 'customeranstime' || h.includes('ans time') || h.includes('anstime')
  );
  const hangTimeIdx = header.findIndex(
    (h) => h === 'custhangtime' || h.includes('hang time') || h.includes('hangtime')
  );
  const durationIdx = header.findIndex((h) => h === 'call duration' || h.includes('duration'));
  const statusIdx = header.findIndex((h) => h === 'dialstatus' || h.includes('status'));
  const keyIdx = header.findIndex((h) => h === 'pressedkey' || h.includes('key'));

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim());
    if (row.length < 3) continue;

    const rawCustomerPhone = row[numIdx >= 0 ? numIdx : 0] || '';
    const customerPhone = cleanPhoneNumber(rawCustomerPhone);
    if (!customerPhone) continue;

    const agentNumber = row[agentNumIdx >= 0 ? agentNumIdx : 1] || '';
    const agentName = row[agentNameIdx >= 0 ? agentNameIdx : 2] || 'Unassigned';
    const dialTime = row[dialTimeIdx >= 0 ? dialTimeIdx : 3] || new Date().toISOString();
    const customerAnsTime = ansTimeIdx >= 0 && row[ansTimeIdx] ? row[ansTimeIdx] : null;
    const customerHangTime = hangTimeIdx >= 0 && row[hangTimeIdx] ? row[hangTimeIdx] : null;
    const rawDuration = durationIdx >= 0 ? parseInt(row[durationIdx], 10) : 0;
    const callDuration = isNaN(rawDuration) ? 0 : Math.max(0, rawDuration);
    const rawStatus = (statusIdx >= 0 ? row[statusIdx] : 'NOANSWER').toUpperCase();
    const dialStatus: 'ANSWER' | 'NOANSWER' = rawStatus === 'ANSWER' ? 'ANSWER' : 'NOANSWER';
    const rawKey = keyIdx >= 0 && row[keyIdx] ? row[keyIdx] : null;
    const pressedKey = rawKey && rawKey !== '' ? rawKey : null;

    const temperature = calculateLeadTemperature(callDuration, pressedKey);

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
    });
  }

  return records;
}
