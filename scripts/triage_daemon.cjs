const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const LLM_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

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
      return {
        processedIds: new Set(),
        hotCount: 0,
        warmCount: 0,
        coldCount: 0,
        errorCount: 0,
        lastUpdated: null,
      };
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

async function updateHeartbeat(status, state, totalEligible, lastTriaged, digestTime) {
  try {
    const payload = {
      status,
      total_eligible: totalEligible,
      processed_count: state.processedIds.size,
      hot_count: state.hotCount,
      warm_count: state.warmCount,
      cold_count: state.coldCount,
      last_triaged: lastTriaged || null,
      heartbeat_at: new Date().toISOString(),
      scheduled_digest_time: digestTime || '19:30',
    };

    await supabase.from('portal_settings').upsert({
      key: 'voice_ai_triage_heartbeat',
      value: payload,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to update triage heartbeat in portal_settings:', err.message);
  }
}

async function getAudioBuffer(record) {
  const raw = record.raw_payload || {};
  let storagePath = raw.storage_path;

  if (storagePath && !storagePath.startsWith('expired_404')) {
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
    if (!error && data) {
      const arrayBuffer = await data.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        filename: path.basename(storagePath),
        mimeType: storagePath.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
      };
    }
  }

  const recordingUrl = raw.recording_url;
  if (!recordingUrl || !recordingUrl.startsWith('http')) {
    return null;
  }

  try {
    const res = await fetch(recordingUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (SVI-VoiceAI-Triage)' },
    });
    if (!res.ok) {
      if (res.status === 404) {
        await supabase
          .from('ivr_call_records')
          .update({
            raw_payload: {
              ...raw,
              storage_path: 'expired_404',
              storage_error: 'HTTP 404',
            },
          })
          .eq('id', record.id);
      }
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    const cleanPhone = (record.customer_phone || '').replace(/\D/g, '').slice(-10) || 'unknown';
    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `${cleanPhone}_rec.wav`,
      mimeType: 'audio/wav',
    };
  } catch {
    return null;
  }
}

async function transcribeWithWhisper(audioBuffer, filename, mimeType) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';

  const parts = [];
  parts.push(
    Buffer.from(
      `--${boundary}${crlf}Content-Disposition: form-data; name="file"; filename="${filename}"${crlf}Content-Type: ${mimeType}${crlf}${crlf}`
    )
  );
  parts.push(audioBuffer);
  parts.push(Buffer.from(crlf));

  const addField = (name, value) => {
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}Content-Disposition: form-data; name="${name}"${crlf}${crlf}${value}${crlf}`
      )
    );
  };

  addField('model', 'whisper-large-v3-turbo');
  addField('response_format', 'verbose_json');
  addField('temperature', '0.0');
  addField(
    'prompt',
    'SVI Infra Solutions, Khatu Shyam plot, Sivani Vatika, telecaller real estate Hindi English'
  );

  parts.push(Buffer.from(`--${boundary}--${crlf}`));
  const body = Buffer.concat(parts);

  const res = await fetch('https:\x2F\x2Fapi.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq Whisper error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  return {
    text: json.text || '',
    duration: typeof json.duration === 'number' ? json.duration : 0,
    segments: Array.isArray(json.segments) ? json.segments : [],
  };
}

async function analyzeWithGroqLLM(transcript, segments, duration, modelIndex = 0) {
  const model = LLM_MODELS[modelIndex % LLM_MODELS.length];

  const systemPrompt = `You are the Lead Sales & QA Intelligence Engine for SVI Infra Solutions, a luxury real estate developer.
Analyze this call recording transcript between a telecaller and customer.

Return STRICT JSON matching this schema:
{
  "interest_level": "Hot" | "Warm" | "Cold" | "Unqualified",
  "intent": "Site Visit Requested" | "Price Enquiry" | "Call Back Later" | "Not Interested" | "General Info",
  "sentiment": "Positive" | "Neutral" | "Skeptical" | "Negative",
  "budget": string | null,
  "property_interest": string | null,
  "summary": string (1-2 crisp Hinglish sentences),
  "whatsapp_recap": string (Polite WhatsApp message ready to send to customer),
  "quality_scorecard": {
    "pitch_clarity": number (1-5),
    "objection_handling": number (1-5),
    "closing_skill": number (1-5),
    "overall_score": number (1-5),
    "grade": "A+" | "A" | "B" | "C" | "D",
    "key_strengths": string[],
    "coaching_tip": string
  },
  "recommended_action": string,
  "dialogue": Array<{ "speaker": "Telecaller" | "Customer", "text": string, "start_time": number }>
}`;

  const userContent = `CALL DURATION: ${Math.round(duration)}s
TRANSCRIPT:
${transcript}`;

  const res = await fetch('https:\x2F\x2Fapi.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    if (res.status === 429 && modelIndex < LLM_MODELS.length - 1) {
      return analyzeWithGroqLLM(transcript, segments, duration, modelIndex + 1);
    }
    const errText = await res.text();
    throw new Error(`Groq LLM error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const rawText = json.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(rawText);

  return {
    parsed,
    modelUsed: `whisper-large-v3-turbo + ${model}`,
  };
}

async function dispatchHotLeadAlert(record, intelligence) {
  try {
    const customerPhone = record.customer_phone;
    const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);

    const { data: settingsRow } = await supabase
      .from('portal_settings')
      .select('value')
      .eq('key', 'hot_lead_notification_settings')
      .maybeSingle();

    const settings = settingsRow?.value || {};
    if (settings.enabled === false) return;

    await supabase.from('notifications').insert([
      {
        title: `🔥 Hot Lead Alert: +91 ${cleanPhone}`,
        message: `${intelligence.summary || 'Customer requested site visit / pricing'}. Budget: ${
          intelligence.budget || 'N/A'
        }`,
        type: 'warning',
        action_url: `/admin/leads?tab=ivr&search=${cleanPhone}`,
        metadata: {
          customer_phone: cleanPhone,
          call_record_id: record.id,
          interest_level: 'Hot',
          intent: intelligence.intent,
          budget: intelligence.budget,
        },
      },
    ]);

    if (!resendApiKey) return;

    const recipients = Array.isArray(settings.recipients)
      ? settings.recipients.filter((r) => r.email && r.enabled !== false)
      : [{ email: 'sviiinfrasolutions@gmail.com', name: 'Primary Admin' }];

    for (const r of recipients) {
      const formattedPhone = '+91 ' + cleanPhone;
      const waGreeting = "Namaste Sir/Ma'am, SVI Infra Solutions se baat kar rahe hain. Aapne Khatu Shyam Ji / Shivani Vatika township ke baare me inquiry ki thi. Kya hum aapki visit schedule kar dein?";
      const waUrl = 'https:\x2F\x2Fwa.me/91' + cleanPhone + '?text=' + encodeURIComponent(waGreeting);
      const crmUrl = 'https:\x2F\x2Fsviinfrasolutions.com/admin/leads?tab=ivr&search=' + cleanPhone;

      const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VIP Hot Lead Alert - SVI Infra Solutions</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e5e9f0; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(15, 23, 42, 0.07), 0 2px 6px rgba(15, 23, 42, 0.04);">
          
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #d4af37 0%, #f6e05e 50%, #d4af37 100%);"></td>
          </tr>

          <tr>
            <td style="padding: 28px 32px 22px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle">
                    <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; padding: 3px 8px; border-radius: 4px;">
                      ⚡ SVI VIP VOICE RADAR
                    </div>
                    <div style="font-size: 21px; font-weight: 800; color: #0f172a; margin-top: 8px; letter-spacing: -0.4px; line-height: 1.25;">
                      🔥 High-Priority Hot Lead
                    </div>
                  </td>
                  <td align="right" valign="top" style="width: 130px;">
                    <span style="display: inline-block; background-color: #fee2e2; border: 1px solid #fecaca; color: #991b1b; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 14px; letter-spacing: 0.5px; white-space: nowrap;">
                      ACTION REQUIRED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 18px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td width="50%" valign="top" style="padding: 16px 20px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Customer Phone</div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, monospace;">
                      <a href="tel:+91${cleanPhone}" style="color: #0f172a; text-decoration: none;">${formattedPhone}</a>
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Primary Intent</div>
                    <div style="font-size: 14px; font-weight: 800; color: #0284c7; margin-top: 4px;">
                      ${intelligence.intent || 'Site Visit Requested'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top" style="padding: 16px 20px; border-right: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Estimated Budget</div>
                    <div style="font-size: 15px; font-weight: 800; color: #b45309; margin-top: 4px;">
                      ${intelligence.budget || 'Open / Discussion'}
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding: 16px 20px;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.8px;">Call Duration</div>
                    <div style="font-size: 15px; font-weight: 800; color: #334155; margin-top: 4px;">
                      ${record.call_duration || 0}s
                    </div>
                  </td>
                </tr>
                ${intelligence.property_interest ? `
                <tr>
                  <td colspan="2" style="padding: 12px 20px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
                    <span style="font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 800; letter-spacing: 0.6px;">Property Requirement: </span>
                    <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${intelligence.property_interest}</span>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #d4af37; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);">
                <tr>
                  <td style="padding: 16px 20px 14px 20px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px;">
                      🎙️ Voice AI Call Synopsis (Hinglish)
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; color: #334155; font-style: italic;">
                      "${intelligence.summary}"
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px 14px 20px; border-top: 1px dashed #e2e8f0; background-color: #fafbfc;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td valign="top" style="width: 20px; padding-top: 1px;">
                          <span style="font-size: 13px;">🎯</span>
                        </td>
                        <td valign="top" style="padding-left: 8px;">
                          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #166534;">Recommended Next Step: </span>
                          <span style="font-size: 13px; font-weight: 700; color: #15803d;">${intelligence.recommended_action || 'WhatsApp par location map, brochure bhejo aur site visit confirm karo'}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" align="center" valign="top">
                    <a href="tel:+91${cleanPhone}" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #080b11; text-align: center; padding: 13px 14px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);">
                      <div style="font-size: 14px; font-weight: 800; line-height: 1.2;">📞 Call Client</div>
                      <div style="font-size: 11px; font-weight: 700; color: #1e293b; margin-top: 2px; font-family: monospace;">${formattedPhone}</div>
                    </a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" align="center" valign="top">
                    <a href="${waUrl}" style="display: block; width: 100%; box-sizing: border-box; background: #25d366; color: #ffffff; text-align: center; padding: 13px 14px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.25);">
                      <div style="font-size: 14px; font-weight: 800; line-height: 1.2;">💬 Chat on WhatsApp</div>
                      <div style="font-size: 11px; font-weight: 700; color: #f0fdf4; margin-top: 2px;">Instant Follow-up</div>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td colspan="3" align="center" style="padding-top: 18px;">
                    <a href="${crmUrl}" style="display: inline-block; color: #475569; font-size: 12px; font-weight: 700; text-decoration: none; border-bottom: 1px dashed #94a3b8; padding-bottom: 2px;">
                      Open Lead Dossier in Admin CRM →
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

      await fetch('https:\x2F\x2Fapi.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SVI Infra Alerts <alerts@sviinfrasolutions.com>',
          to: [r.email],
          subject: `🔥 VIP Hot Lead Detected: +91 ${cleanPhone} (${intelligence.intent || 'High Intent'})`,
          html: emailHtml,
        }),
      }).catch((e) => console.warn('Resend instant alert error:', e.message));
    }
    const nowIso = new Date().toISOString();
    const dateFormatted = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const reasonText = `Reason: ${intelligence.intent || 'High Interest'}. Budget: ${intelligence.budget || 'Not specified'}. Call Duration: ${record.call_duration || 0}s. Summary: ${intelligence.summary}`;

    const { data: existingLeads } = await supabase
      .from('chat_leads')
      .select('id, name, notes, phone')
      .ilike('phone', `%${cleanPhone}%`)
      .limit(1);

    let leadId = null;
    if (existingLeads && existingLeads.length > 0) {
      const current = existingLeads[0];
      leadId = current.id;
      const updatedNotes = (current.notes ? current.notes + '\n\n' : '') + `[Updated by AI on ${dateFormatted}] ${reasonText}`;
      await supabase
        .from('chat_leads')
        .update({
          temperature: 'hot',
          summary: intelligence.summary,
          budget: intelligence.budget || undefined,
          project_interest: intelligence.property_interest || undefined,
          notes: updatedNotes,
          updated_at: nowIso,
        })
        .eq('id', leadId);

      await supabase.from('lead_activities').insert([
        {
          lead_id: leadId,
          employee_id: null,
          employee_name: 'Voice AI Triage Engine',
          activity_type: 'note_added',
          title: 'Updated by AI: Hot Lead Identified',
          notes: reasonText,
          created_at: nowIso,
        },
      ]);
    } else {
      const { data: newLead } = await supabase
        .from('chat_leads')
        .insert([
          {
            name: `Customer +91${cleanPhone}`,
            phone: `+91${cleanPhone}`,
            normalized_phone: `+91${cleanPhone}`,
            source: 'ivr',
            temperature: 'hot',
            summary: intelligence.summary,
            budget: intelligence.budget || null,
            project_interest: intelligence.property_interest || null,
            qualification_status: 'qualified',
            lifecycle_status: 'lead',
            lead_created_by: 'Voice AI Triage Engine',
            notes: `[Created & Updated by AI on ${dateFormatted}] ${reasonText}`,
            created_at: nowIso,
            updated_at: nowIso,
          },
        ])
        .select('id')
        .single();

      if (newLead && newLead.id) {
        leadId = newLead.id;
        await supabase.from('lead_activities').insert([
          {
            lead_id: leadId,
            employee_id: null,
            employee_name: 'Voice AI Triage Engine',
            activity_type: 'lead_created',
            title: 'Lead Created & Updated by AI: Hot Lead',
            notes: reasonText,
            created_at: nowIso,
          },
        ]);
      }
    }
  } catch (err) {
    console.warn('Failed to dispatch instant hot lead alert:', err.message);
  }
}

async function dispatchScheduledDigest(istTimeStr) {
  try {
    const { data: settingsRow } = await supabase
      .from('portal_settings')
      .select('value')
      .eq('key', 'hot_lead_notification_settings')
      .maybeSingle();

    const settings = settingsRow?.value || {};
    const recipients = Array.isArray(settings.recipients)
      ? settings.recipients.filter((r) => r.email && r.enabled !== false)
      : [{ email: 'sviiinfrasolutions@gmail.com', name: 'Primary Admin' }];

    const { data: records } = await supabase
      .from('ivr_call_records')
      .select('id, customer_phone, call_duration, created_at, raw_payload')
      .not('raw_payload->ai_intelligence', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30);

    const validLeads = (records || []).filter((r) => {
      const intel = r.raw_payload?.ai_intelligence;
      return intel && (intel.interest_level === 'Hot' || intel.interest_level === 'Warm');
    });

    if (validLeads.length === 0) return;

    await supabase.from('notifications').insert([
      {
        user_id: null,
        title: `📋 Daily VIP Leads Digest (${istTimeStr} IST)`,
        message: `${validLeads.length} Hot & Warm opportunities triaged today. Check your email or open CRM to review.`,
        type: 'report',
        link: '/admin/leads?tab=ivr',
        is_read: false,
      },
    ]);

    if (!resendApiKey) return;

    for (const r of recipients) {
      const leadsListHtml = validLeads
        .slice(0, 10)
        .map((l) => {
          const intel = l.raw_payload.ai_intelligence;
          const phone = (l.customer_phone || '').replace(/\D/g, '').slice(-10);
          return `<div style="border-bottom:1px solid #1e293b;padding:12px 0;">
            <p style="margin:0;font-size:14px;font-weight:bold;color:${intel.interest_level === 'Hot' ? '#f43f5e' : '#f59e0b'};">
              [${intel.interest_level.toUpperCase()}] +91 ${phone} • ${intel.intent || 'Enquiry'}
            </p>
            <p style="margin:4px 0 0 0;font-size:12px;color:#94a3b8;">${intel.summary || ''}</p>
          </div>`;
        })
        .join('');

      const digestHtml = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#080b11;font-family:Arial,sans-serif;color:#ffffff;">
  <div style="max-width:640px;margin:0 auto;background:#111622;border:1px solid #d4af37;border-radius:12px;padding:28px;">
    <h2 style="color:#d4af37;margin-top:0;">📋 Daily VIP Leads Digest</h2>
    <p style="color:#94a3b8;font-size:13px;">Time: ${istTimeStr} IST • Opportunities: ${validLeads.length} Hot/Warm Leads</p>
    <div style="margin:20px 0;">
      ${leadsListHtml}
    </div>
    <div style="margin-top:24px;">
      <a href="https:\x2F\x2Fsviinfrasolutions.com/admin/leads?tab=ivr" style="display:inline-block;background:#d4af37;color:#080b11;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">Open CRM Leads Hub</a>
    </div>
  </div>
</body>
</html>`;

      await fetch('https:\x2F\x2Fapi.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SVI Executive Digest <alerts@sviinfrasolutions.com>',
          to: [r.email],
          subject: `📋 Daily VIP Leads Digest (${validLeads.length} Hot/Warm Opportunities)`,
          html: digestHtml,
        }),
      }).catch((e) => console.warn('Resend digest email error:', e.message));
    }

    console.log(`[DIGEST] Dispatched scheduled daily digest (${validLeads.length} leads) at ${istTimeStr} IST`);
  } catch (err) {
    console.warn('Failed to dispatch scheduled digest:', err.message);
  }
}

async function processSingleCall(record, state) {
  const audioData = await getAudioBuffer(record);
  if (!audioData) {
    state.errorCount++;
    state.processedIds.add(record.id);
    return null;
  }

  const { text: transcript, duration, segments } = await transcribeWithWhisper(
    audioData.buffer,
    audioData.filename,
    audioData.mimeType
  );

  const { parsed, modelUsed } = await analyzeWithGroqLLM(transcript, segments, duration);

  const dialogue = Array.isArray(parsed.dialogue)
    ? parsed.dialogue.map((d, idx, arr) => ({
        speaker: d.speaker === 'Customer' ? 'Customer' : 'Telecaller',
        text: String(d.text).trim(),
        start_time: typeof d.start_time === 'number' ? Math.round(d.start_time) : Math.round((idx / arr.length) * duration),
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
    recommended_action: String(parsed.recommended_action || 'Follow up with lead on phone/WhatsApp'),
    quality_scorecard: {
      pitch_clarity: Number(parsed.quality_scorecard?.pitch_clarity) || 7,
      objection_handling: Number(parsed.quality_scorecard?.objection_handling) || 7,
      closing_skill: Number(parsed.quality_scorecard?.closing_skill) || 8,
      overall_score: Number(parsed.quality_scorecard?.overall_score) || 7.7,
      grade: String(parsed.quality_scorecard?.grade || 'B'),
      coaching_tip: String(parsed.quality_scorecard?.coaching_tip || 'Follow up promptly.'),
      key_strengths: Array.isArray(parsed.quality_scorecard?.key_strengths)
        ? parsed.quality_scorecard.key_strengths.map(String)
        : ['Clear voice'],
    },
    whatsapp_recap: String(parsed.whatsapp_recap || 'Namaste Sir, SVI Infra details...'),
    dialogue,
    dialogue_transcript: dialogue.map((d) => `${d.speaker}: ${d.text}`).join('\n\n') || transcript,
    raw_transcript: transcript,
    analyzed_at: new Date().toISOString(),
    model_used: modelUsed,
    duration,
  };

  const raw = record.raw_payload || {};
  await supabase
    .from('ivr_call_records')
    .update({
      raw_payload: {
        ...raw,
        ai_intelligence: intelligence,
      },
    })
    .eq('id', record.id);

  const customerPhone = record.customer_phone;
  if (customerPhone) {
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (intelligence.interest_level === 'Hot') {
      await supabase
        .from('chat_leads')
        .update({ temperature: 'hot' })
        .like('phone', `%${cleanPhone}%`);

      await dispatchHotLeadAlert(record, intelligence);
    }
  }

  state.processedIds.add(record.id);
  if (intelligence.interest_level === 'Hot') state.hotCount++;
  else if (intelligence.interest_level === 'Warm') state.warmCount++;
  else state.coldCount++;

  return intelligence;
}

async function runAutonomousDaemon() {
  const minDuration = 25;
  const pollIntervalMs = 60 * 1000;
  const targetDigestTime = '19:30';
  let lastDigestDate = null;

  console.log('=== SVI Autonomous Voice AI Triage & VIP Dispatch Daemon ===');
  console.log(`Min Duration: ${minDuration}s | Poll Interval: ${pollIntervalMs / 1000}s | Digest: ${targetDigestTime} IST`);

  const state = loadCheckpoint();

  while (true) {
    try {
      const now = new Date();
      const istTimeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const todayDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      if (istTimeStr === targetDigestTime && lastDigestDate !== todayDateStr) {
        lastDigestDate = todayDateStr;
        await dispatchScheduledDigest(istTimeStr);
      }

      const { count: totalEligible } = await supabase
        .from('ivr_call_records')
        .select('id', { count: 'exact', head: true })
        .eq('dial_status', 'ANSWER')
        .gte('call_duration', minDuration)
        .not('raw_payload->storage_path', 'is', null)
        .neq('raw_payload->>storage_path', 'expired_404')
        .is('raw_payload->ai_intelligence', null);

      if (!totalEligible || totalEligible === 0) {
        await updateHeartbeat('idle', state, totalEligible || 0, null, targetDigestTime);
        console.log(`[IDLE] All calls triaged. Waiting ${pollIntervalMs / 1000}s for incoming calls...`);
        await new Promise((res) => setTimeout(res, pollIntervalMs));
        continue;
      }

      const { data: records, error } = await supabase
        .from('ivr_call_records')
        .select('id, customer_phone, dial_time, created_at, call_duration, raw_payload')
        .eq('dial_status', 'ANSWER')
        .gte('call_duration', minDuration)
        .not('raw_payload->storage_path', 'is', null)
        .neq('raw_payload->>storage_path', 'expired_404')
        .is('raw_payload->ai_intelligence', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !records || records.length === 0) {
        await updateHeartbeat('idle', state, totalEligible || 0, null, targetDigestTime);
        await new Promise((res) => setTimeout(res, pollIntervalMs));
        continue;
      }

      const pending = records.filter((r) => !state.processedIds.has(r.id));
      if (pending.length === 0) {
        await updateHeartbeat('idle', state, totalEligible, null, targetDigestTime);
        await new Promise((res) => setTimeout(res, pollIntervalMs));
        continue;
      }

      for (const record of pending) {
        await updateHeartbeat('running', state, totalEligible, null, targetDigestTime);

        try {
          const intelligence = await processSingleCall(record, state);
          if (intelligence) {
            const lastTriaged = {
              phone: (record.customer_phone || '').replace(/\D/g, '').slice(-10),
              duration: record.call_duration,
              interest_level: intelligence.interest_level,
              intent: intelligence.intent,
              summary: intelligence.summary,
              budget: intelligence.budget,
              at: new Date().toISOString(),
            };
            saveCheckpoint(state);
            await updateHeartbeat('running', state, totalEligible, lastTriaged, targetDigestTime);
            console.log(
              `[TRIAGED] +91 ${lastTriaged.phone} (${lastTriaged.duration}s) -> [${lastTriaged.interest_level}] ${lastTriaged.intent}`
            );
          }
        } catch (itemErr) {
          state.errorCount++;
          state.processedIds.add(record.id);
          saveCheckpoint(state);
          console.warn(`[FAIL] Call ${record.id}:`, itemErr.message);
        }

        await new Promise((res) => setTimeout(res, 1200));
      }
    } catch (loopErr) {
      console.error('[DAEMON ERROR]:', loopErr.message);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

runAutonomousDaemon().catch((fatal) => {
  console.error('Fatal daemon crash:', fatal);
  process.exit(1);
});
