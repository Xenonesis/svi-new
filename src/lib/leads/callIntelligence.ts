import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { isAllowedRecordingUrl } from '@/src/lib/leads/recordingProxy';
import {
  CALL_RECORDINGS_BUCKET,
  deriveStoragePath,
  syncRecordingToInHouseStorage,
} from '@/src/lib/leads/syncRecordingToStorage';
export interface QualityScorecard {
  pitch_clarity: number; // 1-10
  objection_handling: number; // 1-10
  closing_skill: number; // 1-10
  overall_score: number; // 1-10
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Training';
  coaching_tip: string;
  key_strengths: string[];
}

export interface DialogueTurn {
  speaker: 'Telecaller' | 'Customer';
  text: string;
  start_time?: number;
}

export interface CallIntelligence {
  summary: string;
  interest_level: 'Hot' | 'Warm' | 'Cold' | 'Unqualified';
  sentiment: 'Positive' | 'Neutral' | 'Skeptical' | 'Negative';
  intent:
    | 'Site Visit Requested'
    | 'Price Enquiry'
    | 'Call Back Later'
    | 'Not Interested'
    | 'General Info';
  budget: string | null;
  property_interest: string | null;
  recommended_action: string;
  transcript: string;
  dialogue?: DialogueTurn[];
  raw_transcript?: string;
  duration?: number;
  analyzed_at: string;
  model_used: string;
  quality_scorecard?: QualityScorecard;
  whatsapp_recap?: string;
}

export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface WhisperResponse {
  text?: string;
  duration?: number;
  segments?: WhisperSegment[];
  error?: { message: string };
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: { message: string };
}

/**
 * Transcribes audio via Groq Whisper Large V3 Turbo API.
 */
export async function transcribeCallAudio(
  audioBuffer: Buffer | ArrayBuffer,
  filename = 'recording.wav',
  mimeType = 'audio/wav'
): Promise<{ text: string; duration?: number; segments?: WhisperSegment[] }> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured in server environment');
  }

  const formData = new FormData();
  const uint8 = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8], { type: mimeType });
  formData.append('file', blob, filename);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'verbose_json');
  formData.append(
    'prompt',
    'Real estate telecalling in Hindi and Hinglish for SVI Infra. Locations: Jaipur, Khatu Shyam ji, Shivani Vatika, Ring Road, Haryana, Panipat, Meerut. Terms: plot, gaj, sq yards, registry, loan, EMI, down payment, rate per gaj. Telecaller and customer dialogue.'
  );
  formData.append('temperature', '0.0');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Groq Whisper transcription failed (${res.status}): ${errorBody}`);
  }

  const data = (await res.json()) as WhisperResponse;
  if (!data.text) {
    throw new Error(data.error?.message || 'Empty transcript received from Groq Whisper');
  }

  return {
    text: data.text.trim(),
    duration: data.duration,
    segments: data.segments,
  };
}

/**
 * Analyzes call transcript using Groq LLM to extract structured sales intelligence.
 */
export async function analyzeCallTranscript(
  transcript: string,
  duration?: number
): Promise<Omit<CallIntelligence, 'transcript' | 'analyzed_at' | 'model_used'>> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured in server environment');
  }

  const prompt = `You are an expert Real Estate Telecalling Analyst and Dialogue Reconstructor for SVI Infra (Jaipur, Rajasthan).
Analyze this customer-telecaller conversation and extract actionable sales intelligence and a clean turn-by-turn dialogue.

CRITICAL LANGUAGE INSTRUCTION:
Write "summary", "recommended_action", and "coaching_tip" in VERY SIMPLE, EVERYDAY SPOKEN HINGLISH (daily Hindi-English mix written in clean Roman English script, e.g. "Customer ko Khatu Shyam ke paas 100 gaj plot chahiye...").
DO NOT use heavy, complicated or formal English words.
Make it so simple and clear that any telecaller, field agent, or manager can understand the core deal points in 2 seconds.

Conversation Transcript:
"""${transcript}"""

Output your analysis in STRICT JSON format with the following exact keys:
{
  "summary": "2-3 seedhi aur saral lines Hinglish me describing client requirement, plot size, budget, and call outcome",
  "interest_level": "Hot" | "Warm" | "Cold" | "Unqualified",
  "sentiment": "Positive" | "Neutral" | "Skeptical" | "Negative",
  "intent": "Site Visit Requested" | "Price Enquiry" | "Call Back Later" | "Not Interested" | "General Info",
  "budget": "string describing customer budget in plain format (e.g. '15-20 Lakhs') or null if not discussed",
  "property_interest": "string describing plot size, project name, or location discussed (e.g. '100 gaj near Khatu Shyam/Ring Road')",
  "recommended_action": "1 simple, direct action in Hinglish (e.g. 'WhatsApp par location aur brochure bhejo aur Sunday visit confirm karo')",
  "quality_scorecard": {
    "pitch_clarity": 1-10 integer rating for clarity of project pitch and connectivity,
    "objection_handling": 1-10 integer rating for addressing doubts on rate, distance, or loans,
    "closing_skill": 1-10 integer rating for asking for site visit / office meeting,
    "overall_score": 1-10 composite score,
    "grade": "A+" | "A" | "B" | "C" | "Needs Training",
    "coaching_tip": "1 simple advice in Hinglish for telecaller (e.g. 'Customer ko pehle registry hand-to-hand hone ki baat batayein')",
    "key_strengths": ["strength 1 in simple terms", "strength 2 in simple terms"]
  },
  "whatsapp_recap": "A warm, high-converting WhatsApp message in simple Hinglish summarizing call discussions, plot details, and invite for site visit, ready to send to customer",
  "dialogue": [
    {
      "speaker": "Telecaller" | "Customer",
      "text": "Clean, natural sentence in spoken Hindi/Hinglish"
    }
  ]
}
IMPORTANT RULES FOR "dialogue":
1. Clean up acoustic noise (filter out repetitive ringing 'Hello Hello Hello...').
2. Separate into back-and-forth turns between 'Telecaller' and 'Customer'.
3. Correct obvious speech-to-text mistranslations:
   - 'dollars' or '$15,000' -> 'gaj / ₹15,000 per gaj'.
   - 'water'/'paani' when referring to customer location -> 'Panipat, Haryana'.
   - 'Khatou Samh' -> 'Khatu Shyam ji'.
4. Keep natural conversational Hindi/Hinglish so it is clear and readable.

IMPORTANT: Output ONLY the valid JSON object with no markdown wrappers or other commentary.`;

  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });

      if (!res.ok) {
        throw new Error(`Model ${model} returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as GroqChatResponse;
      const rawContent = data.choices?.[0]?.message?.content?.trim();
      if (!rawContent) {
        throw new Error(`Empty response content from ${model}`);
      }

      // Parse JSON safely
      const cleanJson = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanJson);
      return {
        summary: String(parsed.summary || 'Summary unavailable'),
        interest_level: ['Hot', 'Warm', 'Cold', 'Unqualified'].includes(parsed.interest_level)
          ? parsed.interest_level
          : 'Warm',
        sentiment: ['Positive', 'Neutral', 'Skeptical', 'Negative'].includes(parsed.sentiment)
          ? parsed.sentiment
          : 'Neutral',
        intent: [
          'Site Visit Requested',
          'Price Enquiry',
          'Call Back Later',
          'Not Interested',
          'General Info',
        ].includes(parsed.intent)
          ? parsed.intent
          : 'General Info',
        budget: parsed.budget ? String(parsed.budget) : null,
        property_interest: parsed.property_interest ? String(parsed.property_interest) : null,
        recommended_action: String(
          parsed.recommended_action || 'Follow up with lead on phone/WhatsApp'
        ),
        quality_scorecard: (() => {
          const qs = (parsed.quality_scorecard || {}) as Record<string, unknown>;
          const pitch =
            typeof qs.pitch_clarity === 'number'
              ? Math.max(1, Math.min(10, Math.round(qs.pitch_clarity)))
              : 8;
          const objections =
            typeof qs.objection_handling === 'number'
              ? Math.max(1, Math.min(10, Math.round(qs.objection_handling)))
              : 7;
          const closing =
            typeof qs.closing_skill === 'number'
              ? Math.max(1, Math.min(10, Math.round(qs.closing_skill)))
              : 8;
          const overall =
            typeof qs.overall_score === 'number'
              ? Math.max(1, Math.min(10, Number(qs.overall_score.toFixed(1))))
              : Number((pitch * 0.35 + objections * 0.35 + closing * 0.3).toFixed(1));
          const grade =
            overall >= 9
              ? 'A+'
              : overall >= 8
                ? 'A'
                : overall >= 7
                  ? 'B'
                  : overall >= 5
                    ? 'C'
                    : 'Needs Training';
          return {
            pitch_clarity: pitch,
            objection_handling: objections,
            closing_skill: closing,
            overall_score: overall,
            grade: (['A+', 'A', 'B', 'C', 'Needs Training'].includes(String(qs.grade))
              ? qs.grade
              : grade) as QualityScorecard['grade'],
            coaching_tip: String(
              qs.coaching_tip ||
                'Highlight project registry and location advantages early in the pitch.'
            ),
            key_strengths:
              Array.isArray(qs.key_strengths) && qs.key_strengths.length > 0
                ? qs.key_strengths.map(String)
                : ['Polite greeting', 'Shared project details'],
          };
        })(),
        whatsapp_recap: parsed.whatsapp_recap
          ? String(parsed.whatsapp_recap).trim()
          : `Namaste Sir, aaj hamari call par baat hui thi. SVI Infra ke Shivani Vatika project (Khatu Shyam / Ring Road) ki details:\n\n• Plot Size: ${parsed.property_interest || '100 Gaj'}\n• Gated Township, Instant Registry\n\nBrochure & visit booking ke liye reply karein.\n— SVI Infra Solutions`,
        dialogue: Array.isArray(parsed.dialogue)
          ? parsed.dialogue
              .filter((d: Record<string, unknown>) =>
                Boolean(d && d.text && (d.speaker === 'Telecaller' || d.speaker === 'Customer'))
              )
              .map(
                (
                  d: { speaker: 'Telecaller' | 'Customer'; text: unknown; start_time?: unknown },
                  idx: number,
                  arr: unknown[]
                ) => {
                  let startTime: number | undefined = undefined;
                  if (typeof d.start_time === 'number' && !isNaN(d.start_time)) {
                    startTime = Math.max(0, Math.round(d.start_time));
                  } else if (duration && duration > 0 && arr.length > 0) {
                    startTime = Math.round((idx / arr.length) * duration);
                  }
                  return {
                    speaker: d.speaker,
                    text: String(d.text || '').trim(),
                    start_time: startTime,
                  };
                }
              )
          : [],
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // try next fallback model
    }
  }

  throw lastError || new Error('Failed to analyze transcript with available LLM models');
}

/**
 * End-to-End Orchestrator:
 * Fetches call audio, transcribes it, analyzes it, and persists intelligence to the database.
 */
export async function generateCallIntelligence(params: {
  customerPhone: string;
  recordingUrl: string;
  callRecordId?: string;
  forceRefresh?: boolean;
}): Promise<CallIntelligence> {
  const { customerPhone, recordingUrl, callRecordId, forceRefresh } = params;

  // 1. Check existing cached intelligence in DB
  if (!forceRefresh && callRecordId) {
    const { data: existingRecord } = await supabaseAdmin
      .from('ivr_call_records')
      .select('id, raw_payload')
      .eq('id', callRecordId)
      .single();

    const cached = existingRecord?.raw_payload?.ai_intelligence as CallIntelligence | undefined;
    if (cached && cached.summary && cached.transcript) {
      return cached;
    }
  }

  // 2. Resolve audio buffer (In-House Supabase Storage first, fallback to upstream)
  let audioBuffer: Buffer;
  const storagePath = deriveStoragePath(customerPhone, recordingUrl);
  const pathParts = storagePath.split('/');
  const folder = pathParts.slice(0, -1).join('/');
  const targetFile = pathParts[pathParts.length - 1];

  const { data: existingFiles } = await supabaseAdmin.storage
    .from(CALL_RECORDINGS_BUCKET)
    .list(folder, { search: targetFile, limit: 1 });

  const isAlreadyInStorage = existingFiles && existingFiles.some((f) => f.name === targetFile);

  if (isAlreadyInStorage) {
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(CALL_RECORDINGS_BUCKET)
      .download(storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download audio from in-house storage: ${downloadError?.message}`);
    }

    const arrayBuf = await fileData.arrayBuffer();
    audioBuffer = Buffer.from(arrayBuf);
  } else {
    // Validate upstream URL
    if (!isAllowedRecordingUrl(recordingUrl)) {
      throw new Error('Recording URL is not from an authorized telephony host');
    }

    const res = await fetch(recordingUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch audio from telephony server (HTTP ${res.status})`);
    }

    const arrayBuf = await res.arrayBuffer();
    audioBuffer = Buffer.from(arrayBuf);

    // Schedule background archival so next time it is in-house
    syncRecordingToInHouseStorage(customerPhone, recordingUrl).catch((err) => {
      console.warn('Background archival during intelligence failed:', err.message);
    });
  }

  // 3. Transcribe with Whisper
  const transcription = await transcribeCallAudio(audioBuffer, targetFile);

  // 4. Analyze with LLM
  const analysis = await analyzeCallTranscript(transcription.text, transcription.duration);

  const dialogueFormatted =
    analysis.dialogue && analysis.dialogue.length > 0
      ? analysis.dialogue.map((d) => `${d.speaker}: ${d.text}`).join('\n\n')
      : transcription.text;

  const intelligence: CallIntelligence = {
    ...analysis,
    transcript: dialogueFormatted,
    dialogue: analysis.dialogue || [],
    raw_transcript: transcription.text,
    duration: transcription.duration,
    analyzed_at: new Date().toISOString(),
    model_used: 'whisper-large-v3-turbo + qwen/qwen3.8-27b',
  };

  // 5. Persist to DB
  let targetRecordId = callRecordId;
  if (!targetRecordId && recordingUrl) {
    const { data: matched } = await supabaseAdmin
      .from('ivr_call_records')
      .select('id, raw_payload')
      .eq('raw_payload->>recording_url', recordingUrl)
      .limit(1)
      .maybeSingle();
    if (matched) {
      targetRecordId = matched.id;
    }
  }

  if (targetRecordId) {
    try {
      const { data: currentRecord } = await supabaseAdmin
        .from('ivr_call_records')
        .select('raw_payload')
        .eq('id', targetRecordId)
        .single();

      const existingPayload = (currentRecord?.raw_payload || {}) as Record<string, unknown>;
      const updatedPayload = {
        ...existingPayload,
        ai_intelligence: intelligence,
      };

      await supabaseAdmin
        .from('ivr_call_records')
        .update({ raw_payload: updatedPayload })
        .eq('id', targetRecordId);
      // If Hot lead, sync temperature to chat_leads
      if (intelligence.interest_level === 'Hot' && customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
        await supabaseAdmin
          .from('chat_leads')
          .update({ temperature: 'hot' })
          .ilike('phone', `%${cleanPhone}%`);
      }
    } catch (saveError) {
      console.warn('Failed to cache call intelligence into database:', saveError);
    }
  }

  return intelligence;
}

/**
 * Separates an existing raw transcript into turn-by-turn Telecaller vs Customer dialogue.
 */
export async function separateSpeakerTurns(params: {
  transcript: string;
  agentName?: string;
  customerPhone?: string;
  callRecordId?: string;
  duration?: number;
}): Promise<DialogueTurn[]> {
  const { transcript, agentName, callRecordId, duration } = params;
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured in server environment');
  }

  const prompt = `You are an expert Indian real estate telecalling dialogue reconstructor.
Below is the spoken audio text of a phone call between an Advisor (${agentName || 'Advisor'} from SVI Infra) and a Customer.

Task:
Separate who is speaking what into alternating turns:
- "Telecaller" (for the SVI Infra Advisor)
- "Customer" (for the client/customer)

Rules:
1. Retain the spoken Hindi/Hinglish speech accurately without fabricating unrelated facts.
2. Filter out audio ringing and noise (like 'foreign foreign foreign', 'Hello Hello Hello').
3. Output a strict JSON array of objects with keys "speaker" and "text".

Output format:
[
  { "speaker": "Telecaller", "text": "..." },
  { "speaker": "Customer", "text": "..." }
]
Output ONLY valid JSON.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Speaker separation failed (HTTP ${res.status})`);
  }

  const data = (await res.json()) as GroqChatResponse;
  const rawContent = data.choices?.[0]?.message?.content?.trim() || '[]';
  const cleanJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleanJson);
  const dialogue: DialogueTurn[] = Array.isArray(parsed)
    ? parsed
        .filter((d: Record<string, unknown>) =>
          Boolean(
            d &&
            d.text &&
            (d.speaker === 'Telecaller' || d.speaker === 'Customer' || d.speaker === 'Advisor')
          )
        )
        .map(
          (
            d: { speaker: string; text: unknown; start_time?: unknown },
            idx: number,
            arr: unknown[]
          ) => {
            let startTime: number | undefined = undefined;
            if (typeof d.start_time === 'number' && !isNaN(d.start_time)) {
              startTime = Math.max(0, Math.round(d.start_time));
            } else if (duration && duration > 0 && arr.length > 0) {
              startTime = Math.round((idx / arr.length) * duration);
            }
            return {
              speaker: (d.speaker === 'Customer' ? 'Customer' : 'Telecaller') as
                'Telecaller' | 'Customer',
              text: String(d.text).trim(),
              start_time: startTime,
            };
          }
        )
    : [];

  // Persist back to DB if callRecordId provided
  if (callRecordId && dialogue.length > 0) {
    try {
      const { data: currentRecord } = await supabaseAdmin
        .from('ivr_call_records')
        .select('raw_payload')
        .eq('id', callRecordId)
        .single();

      if (currentRecord?.raw_payload?.ai_intelligence) {
        const existingIntel = currentRecord.raw_payload.ai_intelligence as Record<string, unknown>;
        const updatedPayload = {
          ...currentRecord.raw_payload,
          ai_intelligence: {
            ...existingIntel,
            dialogue,
            transcript: dialogue.map((d) => `${d.speaker}: ${d.text}`).join('\n\n'),
          },
        };
        await supabaseAdmin
          .from('ivr_call_records')
          .update({ raw_payload: updatedPayload })
          .eq('id', callRecordId);
      }
    } catch (saveErr) {
      console.warn('Failed to cache separated dialogue to DB:', saveErr);
    }
  }

  return dialogue;
}
