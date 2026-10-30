/**
 * High-Speed Batch AI Call Triage Worker (Phase 4)
 *
 * Transcribes call recordings using Groq Whisper Large V3 Turbo and extracts
 * sales intelligence (intent, sentiment, budget, scorecard, turn-by-turn dialogue,
 * Hinglish summary & WhatsApp follow-up recap) via Groq LLM rotation
 * (qwen/qwen3.8-27b, openai/gpt-oss-120b, openai/gpt-oss-20b).
 *
 * Features:
 *   - Auto-skips calls shorter than --min-duration (default: 25s) to conserve tokens
 *   - Direct in-house Supabase Storage priority for audio buffers (32kbps MP3)
 *   - Correct MIME types: audio/mpeg for .mp3 and audio/wav for .wav
 *   - Multi-model rotation across independent Groq TPM pools on 429 rate limit
 *   - Checkpointing (.ai_triage_progress.json) for auto-resume
 *   - Automatic "Hot Lead" temperature tagging in chat_leads
 *   - Real-time terminal progress reporting
 *
 * Usage:
 *   node scripts/batch_ai_triage.cjs --limit 20
 *   node scripts/batch_ai_triage.cjs --all --concurrency 1 --min-duration 25
 *   node scripts/batch_ai_triage.cjs --reset
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const groqApiKey = getEnv('GROQ_API_KEY');
const resendApiKey = getEnv('RESEND_API_KEY');

if (!supabaseUrl || !serviceRoleKey || !groqApiKey) {
  console.error('Missing required Supabase or Groq credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const BUCKET = 'call-recordings';
const CHECKPOINT_FILE = path.resolve(__dirname, '../.ai_triage_progress.json');

function deriveStoragePath(customerPhone, upstreamUrl, callDate) {
  const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10) || 'unknown';
  let filename = 'recording.wav';
  try {
    const parsed = new URL(upstreamUrl);
    const rawName = parsed.pathname.split('/').pop() || 'recording.wav';
    filename = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
  } catch {
    filename = `rec_${Date.now()}.wav`;
  }

  const d = callDate ? new Date(callDate) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}/${cleanPhone}_${filename}`;
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      return {
        processedIds: new Set(data.processedIds || []),
        hotCount: data.hotCount || 0,
        warmCount: data.warmCount || 0,
        coldCount: data.coldCount || 0,
        errorCount: data.errorCount || 0,
        lastUpdated: data.lastUpdated || null,
      };
    } catch {
      // corrupt file, start fresh
    }
  }
  return {
    processedIds: new Set(),
    hotCount: 0,
    warmCount: 0,
    coldCount: 0,
    errorCount: 0,
    lastUpdated: null,
  };
}

function saveCheckpoint(state) {
  const payload = {
    processedIds: Array.from(state.processedIds),
    hotCount: state.hotCount,
    warmCount: state.warmCount,
    coldCount: state.coldCount,
    errorCount: state.errorCount,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

/**
 * Downloads audio buffer from Supabase Storage with graceful fallback.
 */
async function getAudioBuffer(record) {
  const { customer_phone, dial_time, created_at, raw_payload } = record;
  const directPath = raw_payload?.storage_path;
  const upstreamUrl = raw_payload?.recording_url;

  // Skip known expired calls
  if (directPath === 'expired_404') {
    throw new Error(`Audio marked expired_404 for call ${record.id}`);
  }

  // 1. Direct path check from record metadata (32kbps mono MP3 or legacy WAV)
  if (directPath) {
    const { data: fileData, error } = await supabase.storage.from(BUCKET).download(directPath);
    if (!error && fileData) {
      const arrayBuffer = await fileData.arrayBuffer();
      const filename = directPath.split('/').pop() || 'call.mp3';
      const isMp3 = filename.toLowerCase().endsWith('.mp3');
      return {
        buffer: Buffer.from(arrayBuffer),
        filename,
        mimeType: isMp3 ? 'audio/mpeg' : 'audio/wav',
        source: 'storage_direct',
      };
    }
  }

  // 2. Derive storage path (try .mp3 first, then .wav)
  if (upstreamUrl) {
    const callDate = dial_time || created_at;
    const baseDerived = deriveStoragePath(customer_phone, upstreamUrl, callDate);
    const candidatePaths = [
      baseDerived.replace(/\.wav$/i, '.mp3'),
      baseDerived,
    ];

    for (const candPath of candidatePaths) {
      const pathParts = candPath.split('/');
      const folder = pathParts.slice(0, -1).join('/');
      const targetFile = pathParts[pathParts.length - 1];

      const { data: existingFiles } = await supabase.storage
        .from(BUCKET)
        .list(folder, { search: targetFile, limit: 1 });

      if (existingFiles && existingFiles.some((f) => f.name === targetFile)) {
        const { data: fileData, error } = await supabase.storage.from(BUCKET).download(candPath);
        if (!error && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const isMp3 = candPath.toLowerCase().endsWith('.mp3');
          return {
            buffer: Buffer.from(arrayBuffer),
            filename: targetFile,
            mimeType: isMp3 ? 'audio/mpeg' : 'audio/wav',
            source: 'storage_derived',
          };
        }
      }
    }

    // 3. Last resort fallback: fetch from upstream telephony provider
    try {
      const res = await fetch(upstreamUrl, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          filename: 'call.wav',
          mimeType: 'audio/wav',
          source: 'upstream_fetch',
        };
      }
    } catch {
      // Upstream failed or expired
    }
  }

  throw new Error(`Audio recording unavailable for call ${record.id}`);
}

/**
 * Extracts wait duration in ms from Groq rate-limit headers.
 */
function getRateLimitWaitMs(res, defaultMs = 5000) {
  const resetHeader =
    res.headers.get('x-ratelimit-reset-tokens') ||
    res.headers.get('x-ratelimit-reset-requests') ||
    res.headers.get('retry-after');

  if (resetHeader) {
    const parsed = parseFloat(resetHeader);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.ceil(parsed * 1000) + 1000;
    }
  }
  return defaultMs;
}

/**
 * Transcribes audio via Groq Whisper with retry on rate limit
 */
async function transcribeWithRetry(buffer, filename, mimeType, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const fd = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    fd.append('file', blob, filename);
    fd.append('model', 'whisper-large-v3-turbo');
    fd.append('response_format', 'verbose_json');
    fd.append(
      'prompt',
      'Real estate telecalling in Hindi and Hinglish for SVI Infra. Locations: Jaipur, Khatu Shyam ji, Shivani Vatika, Ring Road, Haryana, Panipat, Meerut. Terms: plot, gaj, sq yards, registry, loan, EMI, down payment, rate per gaj. Telecaller and customer dialogue.'
    );
    fd.append('temperature', '0.0');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + groqApiKey },
      body: fd,
    });

    if (res.ok) {
      return await res.json();
    }

    if (res.status === 429) {
      const waitTime = getRateLimitWaitMs(res, Math.pow(2, attempt) * 2000);
      console.warn(`[Whisper 429] Rate limit hit. Pausing for ${(waitTime / 1000).toFixed(1)}s (Attempt ${attempt}/${maxRetries})...`);
      await new Promise((r) => setTimeout(r, waitTime));
      continue;
    }

    const errText = await res.text();
    throw new Error(`Whisper HTTP ${res.status}: ${errText.slice(0, 150)}`);
  }

  throw new Error('Whisper rate limit retries exhausted');
}

/**
 * Executes LLM call intelligence analysis by rotating across multiple model pools
 * to bypass single-model TPM limits.
 */
async function analyzeWithMultiModelPool(prompt, maxRounds = 3) {
  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

  for (let round = 1; round <= maxRounds; round++) {
    let shortestWaitMs = 15000;

    for (const model of models) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + groqApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { data, model };
      }

      if (res.status === 429) {
        const waitMs = getRateLimitWaitMs(res, 10000);
        if (waitMs < shortestWaitMs) shortestWaitMs = waitMs;
        // Don't sleep yet; immediately try the next independent model pool!
        continue;
      }

      // If other error, continue to next model
    }

    // If all models in the pool returned 429, wait for the shortest reset window
    console.warn(`[All LLMs 429] Rotating pools exhausted. Sleeping ${(shortestWaitMs / 1000).toFixed(1)}s before round ${round + 1}/${maxRounds}...`);
    await new Promise((r) => setTimeout(r, shortestWaitMs));
  }

  throw new Error('All LLM models in pool exhausted retries');
}

async function dispatchHotLeadAlertInScript(record, intelligence) {
  try {
    const { id, customer_phone, call_duration } = record;
    const { data: settingsData } = await supabase
      .from('portal_settings')
      .select('value')
      .eq('key', 'hot_lead_notification_settings')
      .maybeSingle();

    const settings = settingsData?.value || {
      enabled: true,
      in_app_enabled: true,
      recipients: [{ email: 'sviiinfrasolutions@gmail.com', enabled: true }],
    };

    if (!settings.enabled) return;

    if (settings.in_app_enabled) {
      const cleanPhone = (customer_phone || '').replace(/\D/g, '').slice(-10);
      await supabase.from('notifications').insert([
        {
          title: `🔥 Hot Lead Alert: +91 ${customer_phone}`,
          message: `${intelligence.intent} | Budget: ${intelligence.budget || 'Open'} | ${intelligence.summary.slice(0, 160)}...`,
          type: 'warning',
          action_url: `/admin/leads?tab=ivr&search=${cleanPhone}`,
          metadata: {
            customer_phone,
            call_record_id: id,
            interest_level: 'Hot',
            intent: intelligence.intent,
            budget: intelligence.budget,
            property_interest: intelligence.property_interest,
            recommended_action: intelligence.recommended_action,
          },
        },
      ]);
    }

    const activeEmails = (settings.recipients || [])
      .filter((r) => r.enabled && r.email && r.email.includes('@'))
      .map((r) => r.email.trim().toLowerCase());

    const uniqueEmails = Array.from(new Set(activeEmails));
    if (resendApiKey && uniqueEmails.length > 0) {
      const cleanPhone = (customer_phone || '').replace(/\D/g, '').slice(-10);
      const waGreeting = `Namaste Sir/Ma'am, SVI Infra Solutions se baat kar rahe hain. Aapne Khatu Shyam Ji / Shivani Vatika township ke baare me inquiry ki thi. Kya hum aapki visit schedule kar dein?`;
      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waGreeting)}`;
      const crmUrl = `https://sviinfrasolutions.com/admin/leads?tab=ivr&search=${cleanPhone}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VIP Hot Lead Alert - SVI Infra Solutions</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #d4af37 0%, #f6e05e 50%, #d4af37 100%);"></td>
          </tr>

          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 6px;">
                      ⚡ SVI INFRA • VIP VOICE RADAR
                    </div>
                    <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 10px; letter-spacing: -0.5px; line-height: 1.25;">
                      🔥 High-Priority Hot Lead Detected
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.8px;">
                      IMMEDIATE ACTION
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 18px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 22px;">
                <tr>
                  <td width="50%" valign="top" style="padding-bottom: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Customer Contact</div>
                    <div style="font-size: 19px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, monospace;">
                      <a href="tel:+91${cleanPhone}" style="color: #0f172a; text-decoration: none;">+91 ${cleanPhone}</a>
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Primary Intent</div>
                    <div style="font-size: 15px; font-weight: 800; color: #0284c7; margin-top: 4px;">
                      ${intelligence.intent}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Estimated Budget</div>
                    <div style="font-size: 15px; font-weight: 800; color: #b45309; margin-top: 4px;">
                      ${intelligence.budget || 'Open / Quotation Requested'}
                    </div>
                  </td>
                  <td width="50%" valign="top">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Call Duration</div>
                    <div style="font-size: 15px; font-weight: 700; color: #334155; margin-top: 4px;">
                      ${call_duration || 0}s
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 18px 32px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin-bottom: 8px;">
                📝 AI Call Synopsis (Hinglish)
              </div>
              <div style="background-color: #fdfbf7; border-left: 4px solid #d4af37; border-top: 1px solid #fef3c7; border-right: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7; padding: 14px 18px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                "${intelligence.summary}"
              </div>

              <div style="margin-top: 14px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #166534;">
                  🎯 Recommended Action
                </div>
                <div style="font-size: 14px; font-weight: 700; color: #15803d; margin-top: 4px; line-height: 1.5;">
                  ${intelligence.recommended_action || 'WhatsApp par location map, brochure bhejo aur site visit confirm karo'}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" align="center">
                    <a href="tel:+91${cleanPhone}" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #d4af37 0%, #c59b27 100%); color: #080b11; text-align: center; padding: 14px 18px; border-radius: 10px; font-size: 14px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);">
                      📞 Call Client Now (+91 ${cleanPhone})
                    </a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" align="center">
                    <a href="${waUrl}" style="display: block; width: 100%; box-sizing: border-box; background: #25d366; color: #ffffff; text-align: center; padding: 14px 18px; border-radius: 10px; font-size: 14px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.25);">
                      💬 Chat on WhatsApp
                    </a>
                  </td>
                </tr>
                <tr>
                  <td colspan="3" align="center" style="padding-top: 16px;">
                    <a href="${crmUrl}" style="color: #475569; font-size: 12px; font-weight: 700; text-decoration: underline;">
                      Open Lead in Admin CRM (sviinfrasolutions.com) →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                Confidential Internal Transmission • SVI Infra Solutions Telephony Intelligence Suite<br>
                Official Domain: <strong>sviinfrasolutions.com</strong> • Block E-220, Sector 63, Noida, UP 201309
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      for (const email of uniqueEmails) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SVI Infra VIP Radar <noreply@sviiinfrasolutions.com>',
            to: [email],
            subject: `🔥 [HOT LEAD] +91 ${customer_phone} - ${intelligence.intent} (${intelligence.budget || 'Deal Open'})`,
            html,
          }),
        });
        const resJson = await res.json().catch(() => ({}));
        if (res.ok && resJson.id) {
          await supabase.from('email_messages').insert([
            {
              resend_id: resJson.id,
              from_email: 'SVI Infra VIP Radar <noreply@sviiinfrasolutions.com>',
              to_emails: [email],
              subject: `🔥 [HOT LEAD] +91 ${customer_phone} - ${intelligence.intent}`,
              status: 'sent',
              sent_at: new Date().toISOString(),
              metadata: { type: 'hot_lead_alert', customer_phone, interest_level: 'Hot' },
            },
          ]);
        }
      }
    }
  } catch (err) {
    console.warn('Batch script hot lead alert failed:', err.message);
  }
}

async function processSingleCall(record) {
  const { id, customer_phone, raw_payload } = record;

  // 1. Fetch Audio Buffer (MP3 preferred)
  const { buffer, filename, mimeType } = await getAudioBuffer(record);

  // 2. Transcribe via Groq Whisper
  const whisperData = await transcribeWithRetry(buffer, filename, mimeType);
  const transcriptText = (whisperData.text || '').trim();
  if (!transcriptText) throw new Error('Empty transcript from Whisper');

  // 3. Extract Intelligence via Groq LLM (Multi-model Pool)
  const prompt = `You are an expert Real Estate Telecalling Analyst and Dialogue Reconstructor for SVI Infra (Jaipur, Rajasthan).
Analyze this customer-telecaller conversation and extract actionable sales intelligence and a clean turn-by-turn dialogue.

CRITICAL LANGUAGE INSTRUCTION:
Write "summary", "recommended_action", and "coaching_tip" in VERY SIMPLE, EVERYDAY SPOKEN HINGLISH (daily Hindi-English mix written in clean Roman English script, e.g. "Customer ko Khatu Shyam ke paas 100 gaj plot chahiye...").
DO NOT use heavy, complicated or formal English words.
Make it so simple and clear that any telecaller, field agent, or manager can understand the core deal points in 2 seconds.

Conversation Transcript:
"""${transcriptText}"""

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
    "pitch_clarity": 1-10,
    "objection_handling": 1-10,
    "closing_skill": 1-10,
    "overall_score": 1-10,
    "grade": "A+" | "A" | "B" | "C" | "Needs Training",
    "coaching_tip": "1 simple advice in Hinglish for telecaller",
    "key_strengths": ["string", "string"]
  },
  "whatsapp_recap": "A warm, high-converting WhatsApp message in simple Hinglish summarizing call discussions, plot details, and invite for site visit, ready to send to customer",
  "dialogue": [
    {
      "speaker": "Telecaller" | "Customer",
      "text": "Clean natural sentence in spoken Hindi/Hinglish"
    }
  ]
}
IMPORTANT: Output ONLY the valid JSON object with no markdown wrappers.`;

  const { data: llmData, model: modelUsed } = await analyzeWithMultiModelPool(prompt);
  const rawContent = llmData.choices?.[0]?.message?.content?.trim() || '{}';
  const cleanJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const parsed = JSON.parse(cleanJson);

  const duration = whisperData.duration || record.call_duration || 0;
  const dialogue = Array.isArray(parsed.dialogue)
    ? parsed.dialogue
        .filter((d) => d && d.text && (d.speaker === 'Telecaller' || d.speaker === 'Customer'))
        .map((d, idx, arr) => ({
          speaker: d.speaker,
          text: String(d.text).trim(),
          start_time:
            typeof d.start_time === 'number'
              ? Math.round(d.start_time)
              : Math.round((idx / arr.length) * duration),
        }))
    : [];

  const intelligence = {
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
    quality_scorecard: parsed.quality_scorecard || {
      pitch_clarity: 8,
      objection_handling: 7,
      closing_skill: 8,
      overall_score: 7.7,
      grade: 'B',
      coaching_tip: 'Follow up promptly.',
      key_strengths: ['Clear voice'],
    },
    whatsapp_recap: parsed.whatsapp_recap || 'Namaste Sir, SVI Infra details...',
    dialogue,
    transcript:
      dialogue.length > 0
        ? dialogue.map((d) => `${d.speaker}: ${d.text}`).join('\n\n')
        : transcriptText,
    raw_transcript: transcriptText,
    duration,
    analyzed_at: new Date().toISOString(),
    model_used: `whisper-large-v3-turbo + ${modelUsed}`,
  };

  // 4. Update in database
  const updatedPayload = {
    ...(raw_payload || {}),
    ai_intelligence: intelligence,
  };

  await supabase
    .from('ivr_call_records')
    .update({ raw_payload: updatedPayload })
    .eq('id', id);
  if (intelligence.interest_level === 'Hot' && customer_phone) {
    const cleanPhone = customer_phone.replace(/\D/g, '').slice(-10);
    await supabase
      .from('chat_leads')
      .update({ temperature: 'hot' })
      .ilike('phone', `%${cleanPhone}%`);

    // Dispatch Hot Lead alert to all subscribed email recipients & in-app
    await dispatchHotLeadAlertInScript(record, intelligence);
  }
  return intelligence;
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const maxLimit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 20;
  const isAll = args.includes('--all');
  const isReset = args.includes('--reset');

  const minDurationIdx = args.indexOf('--min-duration');
  const minDuration = minDurationIdx >= 0 ? parseInt(args[minDurationIdx + 1], 10) : 25;

  const concurrencyIdx = args.indexOf('--concurrency');
  const concurrency = concurrencyIdx >= 0 ? Math.max(1, parseInt(args[concurrencyIdx + 1], 10)) : 1;

  if (isReset && fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
    console.log('Reset checkpoint file.');
  }

  const state = loadCheckpoint();
  console.log(`=== SVI High-Speed Batch AI Triage Worker (Phase 4) ===`);
  console.log(`Target: ${isAll ? 'ALL Playable Answered Calls' : `${maxLimit} calls`} | Concurrency: ${concurrency} | Min Duration: ${minDuration}s`);

  let isStopping = false;
  const handleExit = () => {
    if (isStopping) return;
    isStopping = true;
    console.log('\nStopping triage worker... Saving checkpoint.');
    saveCheckpoint(state);
    process.exit(0);
  };
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);

  const { count: totalEligibleCount } = await supabase
    .from('ivr_call_records')
    .select('id', { count: 'exact', head: true })
    .eq('dial_status', 'ANSWER')
    .gte('call_duration', minDuration)
    .not('raw_payload->storage_path', 'is', null)
    .neq('raw_payload->>storage_path', 'expired_404')
    .is('raw_payload->ai_intelligence', null);

  console.log(`Total un-triaged playable calls in DB: ${totalEligibleCount || 0}`);

  let processedThisRun = 0;
  let saveCounter = 0;
  const batchSize = 25;

  while (!isStopping) {
    if (!isAll && processedThisRun >= maxLimit) {
      break;
    }

    const currentBatchLimit = isAll ? batchSize : Math.min(batchSize, maxLimit - processedThisRun);

    const { data: records, error } = await supabase
      .from('ivr_call_records')
      .select('id, customer_phone, dial_time, created_at, call_duration, raw_payload')
      .eq('dial_status', 'ANSWER')
      .gte('call_duration', minDuration)
      .not('raw_payload->storage_path', 'is', null)
      .neq('raw_payload->>storage_path', 'expired_404')
      .is('raw_payload->ai_intelligence', null)
      .order('created_at', { ascending: false })
      .limit(currentBatchLimit * 3);

    if (error) {
      console.error('Database query error:', error.message);
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }

    const pendingRecords = (records || []).filter((r) => !state.processedIds.has(r.id));
    if (pendingRecords.length === 0) {
      console.log('No more pending un-triaged calls found. All caught up!');
      break;
    }

    const sliceToProcess = pendingRecords.slice(0, currentBatchLimit);

    for (const r of sliceToProcess) {
      if (isStopping) break;
      if (!isAll && processedThisRun >= maxLimit) break;

      processedThisRun++;
      const currentNum = processedThisRun;
      const totalLabel = isAll ? (totalEligibleCount || '?') : maxLimit;

      try {
        const intel = await processSingleCall(r);
        state.processedIds.add(r.id);

        if (intel.interest_level === 'Hot') state.hotCount++;
        else if (intel.interest_level === 'Warm') state.warmCount++;
        else state.coldCount++;

        const emoji = intel.interest_level === 'Hot' ? '🔥' : intel.interest_level === 'Warm' ? '⚡' : '💤';
        console.log(
          `[${currentNum}/${totalLabel}] ${emoji} +91 ${r.customer_phone} (${r.call_duration}s) -> [${intel.interest_level.toUpperCase()}] | ${intel.intent} | Budget: ${intel.budget || 'N/A'}`
        );
        console.log(`      Summary: "${intel.summary.slice(0, 95)}..."`);
      } catch (err) {
        state.errorCount++;
        state.processedIds.add(r.id);
        console.warn(`[${currentNum}/${totalLabel}] ⚠️ FAIL: +91 ${r.customer_phone} (${err.message})`);
      }

      saveCounter++;
      if (saveCounter % 2 === 0) {
        saveCheckpoint(state);
      }

      await new Promise((res) => setTimeout(res, 1200));
    }
  }

  saveCheckpoint(state);

  console.log('\n=======================================');
  console.log('Batch AI Triage Summary');
  console.log('=======================================');
  console.log(`Total Calls Processed: ${state.processedIds.size}`);
  console.log(`🔥 Hot Intent Leads:   ${state.hotCount}`);
  console.log(`⚡ Warm Leads:          ${state.warmCount}`);
  console.log(`💤 Cold / Unqualified:  ${state.coldCount}`);
  console.log(`⚠️ Errors / Skipped:    ${state.errorCount}`);
  console.log('=======================================\n');
}

main().catch((e) => {
  console.error('Fatal triage error:', e);
  process.exit(1);
});
