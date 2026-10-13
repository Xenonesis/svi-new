import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { streamText, generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import emailTemplates from '@/src/data/email-templates.json';
import {
  sanitizeEmailHtml,
  buildLuxuryEmailHtml,
  getPreviewHtml,
  extractTemplateVars,
} from '@/src/lib/utils/templateParser';
import type { EmailTemplateType, LuxuryEmailVars } from '@/src/lib/utils/templateParser';

export const maxDuration = 30;

// ─── System prompts per action ───────────────────────────────

const EMAIL_SYSTEM_PROMPT = `You are an elite corporate email HTML template designer and writer for SVI Infra Solutions Pvt. Ltd., a premier real estate developer in India.
Write high-end, responsive, executive-level business emails in polished Indian English.

─── PERSPECTIVE & SALUTATION RULES (CRITICAL) ───
1. Employee-to-Management / HR Requests (e.g. Leave Application, Resignation, Formal Request, Expense Claim):
   - SENDER: The Employee.
   - RECIPIENT: Management or HR.
   - SALUTATION: MUST be "Respected Sir/Madam," or "Dear Management," or "Dear HR Team," or "Dear {{manager_name}},".
   - NEVER address "Dear Valued Employee," when drafting a leave request or employee-authored application!
   - SIGN-OFF: "Warm regards, / Sincerely,<br><strong>{{applicant_name}}</strong><br>{{designation}} | SVI Infra Solutions".

2. Company-to-Employee (e.g. Leave Approval/Rejection, Offer Letter, Policy Notice, Appreciation):
   - SENDER: HR or Management.
   - RECIPIENT: The Employee.
   - SALUTATION: "Dear {{name}}," or "Dear Team Member,".

3. Company-to-Client/Customer (e.g. Payment Reminder, Booking Confirmation, Demand Notice, Festival Greeting):
   - SENDER: SVI Infra Solutions.
   - RECIPIENT: The Customer / Investor.
   - SALUTATION: "Dear {{name}}," or "Dear Valued Customer,".

─── GENERAL FORMATTING RULES ───
- Write direct, contextual, and professional email content tailored strictly to what the user prompts.
- Do NOT add unsolicited 'Next Steps', 'Action Roadmaps', or 'Portal CTA Buttons' unless specifically requested in the prompt.
- End with dedicated HR/Advisor desk contact and full corporate footer.
- Use clean, pure variable placeholders without HTML inside braces (e.g. use {{start_date}} and <strong>{{start_date}}</strong>, NEVER {{<strong>start_date</strong>}}).
- Use ₹ for currency (e.g. ₹50,00,000).
- Important Context: The current year is ${new Date().getFullYear()}, corporate office is Block E-220, 2nd Floor, Sector 63, Noida, and official website is https://www.sviinfrasolutions.com`;

const IMPROVE_PROMPT = `You are an expert corporate email text and HTML editor for SVI Infra Solutions.
Improve the given text snippet or email fragment for grammar, tone, clarity, and professionalism according to the user instruction.
CRITICAL RULES:
- Return ONLY the clean, improved inner text or HTML fragment.
- NEVER return <!DOCTYPE html>, <html>, <head>, <style>, or <body> wrappers.
- NEVER wrap output in markdown code blocks like \`\`\`html or \`\`\`.
- If formatting as bullet points, use clean <ul><li style="margin-bottom:6px;">...</li></ul> or clean lines.
- Preserve dynamic template placeholders like {{name}}, {{role}}, {{project}} if present.
- Return ONLY the final improved content, no explanations or boilerplate.`;

const SUMMARIZE_PROMPT = `You are an email thread summarizer for SVI Infra Solutions admin team.
Analyze the email thread and return a JSON object with this exact structure:
{
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["action 1", "action 2"],
  "deadlines": ["deadline 1"],
  "sentiment": "positive|neutral|negative|urgent"
}
- Extract key discussion points as bullet points
- Identify any action items or follow-ups needed
- Note any deadlines or time-sensitive items
- Assess overall sentiment
- Return ONLY valid JSON, no markdown or explanation`;

const POPULATE_TEMPLATE_PROMPT = `You are a template variable assistant for SVI Infra Solutions.
Given a list of template variables and available recipient data, suggest values for each variable.
Return a JSON object with this exact structure:
{
  "suggestions": { "variableName": "suggested value" },
  "confidence": { "variableName": "high|medium|low" }
}
- Map available data to template variables intelligently
- "high" confidence = direct match from data
- "medium" confidence = inferred from related fields
- "low" confidence = best guess based on patterns
- For missing data, use empty string with "low" confidence
- Return ONLY valid JSON`;

const SENTIMENT_PROMPT = `You are a sentiment analysis assistant for SVI Infra Solutions admin team.
Analyze the email and return a JSON object with this exact structure:
{
  "sentiment": "positive|neutral|negative|urgent",
  "score": 0.0,
  "summary": "Brief 1-2 sentence summary of the email's tone and intent",
  "suggestedResponses": [
    { "label": "Professional Acknowledgment", "tone": "professional", "html": "<p>response html</p>" },
    { "label": "Empathetic Response", "tone": "empathetic", "html": "<p>response html</p>" },
    { "label": "Action-Oriented", "tone": "action", "html": "<p>response html</p>" }
  ]
}
- sentiment: positive (happy, grateful), neutral (informational), negative (complaint, frustrated), urgent (time-sensitive, angry)
- score: 0.0 (very negative) to 1.0 (very positive)
- Generate 2-3 suggested response drafts in HTML format
- Responses should be professional, Indian English, property-business appropriate
- Return ONLY valid JSON`;

// ─── Handler ─────────────────────────────────────────────────

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

/**
 * Safely generate text with automatic fallback if primary model is unavailable or rate-limited.
 */
async function safeGenerateText(options: {
  system?: string;
  prompt: string;
  maxOutputTokens?: number;
}): Promise<string> {
  const maxOutputTokens = options.maxOutputTokens ?? 2500;
  try {
    const { text } = await generateText({
      model: groq(PRIMARY_MODEL),
      system: options.system,
      prompt: options.prompt,
      maxOutputTokens,
    });
    return text;
  } catch (primaryErr: unknown) {
    const msg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    console.warn(
      `[AI Email] Primary model (${PRIMARY_MODEL}) failed: ${msg}. Attempting fallback (${FALLBACK_MODEL})...`
    );
    try {
      const { text } = await generateText({
        model: groq(FALLBACK_MODEL),
        system: options.system,
        prompt: options.prompt,
        maxOutputTokens: Math.min(maxOutputTokens, 2000),
      });
      return text;
    } catch (fallbackErr: unknown) {
      const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.error('[AI Email] Fallback model also failed:', fbMsg);
      throw primaryErr;
    }
  }
}

/**
 * Resilient JSON parsing helper that extracts valid JSON even if surrounded by markdown or conversational text.
 */
function safeParseJson<T>(raw: string, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;

  const clean = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    // Continue to regex extraction
  }

  const objMatch = clean.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {
      try {
        const cleanedCommas = objMatch[0].replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(cleanedCommas);
      } catch {
        // Fall through
      }
    }
  }

  const arrMatch = clean.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch {
      try {
        const cleanedCommas = arrMatch[0].replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(cleanedCommas);
      } catch {
        // Fall through
      }
    }
  }

  return fallback;
}
export async function POST(request: NextRequest) {
  // Rate limit: 10 AI requests per admin per minute
  const limited = await rateLimit(request, { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const admin = await verifyAdmin(request);
    const employee = !admin ? await verifyEmployee(request) : null;
    const user = admin || employee?.user;
    if (!user) throw AppError.unauthorized();

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action field' }, { status: 400 });
    }

    // ─── Auto Compose: extract vars via AI, build HTML server-side ───────────
    if (action === 'auto_compose') {
      const { subject, prompt: userPrompt, tone, to } = body;
      if (!subject && !userPrompt) {
        return NextResponse.json({ error: 'Missing subject or prompt' }, { status: 400 });
      }

      // Fetch recipient context if email provided
      let recipientData: Record<string, string> = {};
      if (to) {
        const raw = await fetchRecipientData(to);
        recipientData = Object.fromEntries(
          Object.entries(raw)
            .filter(([, v]) => v !== null && v !== undefined)
            .map(([k, v]) => [k, String(v)])
        );
      }

      // Build existing templates list for AI to match against
      const templatesList = getTemplatesSummary();

      // ── Step 1: AI extracts variables only (small JSON, fast) ──────────────
      const extractPrompt = [
        'You are an expert AI corporate email writer and data extractor for SVI Infra Solutions Pvt. Ltd., a premier real estate developer.',
        '',
        'EXISTING TEMPLATES:',
        templatesList,
        '',
        'TASK:',
        'Analyze the user prompt, determine the best template or compose rich corporate content, and respond ONLY with valid JSON.',
        '',
        'OUTPUT SCHEMA (Return ONLY concrete values, NEVER output placeholder angle brackets):',
        '{',
        '  "action": "template_match" or "ai_template",',
        '  "templateId": "_ai_generated",',
        '  "templateName": "Residential Property Inquiry",',
        '  "subject": "Residential Property Options Near Khatu Shyam - SVI Infra Solutions",',
        '  "emailType": "general",',
        '  "badge": "Residential Property Inquiry",',
        '  "subtitle": "Exclusive Residential Plots & Living Options",',
        '  "body_text": "<p>Thank you for expressing interest in our residential properties near Khatu Shyam Ji...</p><p>We are pleased to introduce our premier gated township options featuring 30ft internal roads, clear titles, and immediate registry...</p>",',
        '  "cta_text": "Schedule Site Visit",',
        '  "cta_url": "https://www.sviinfrasolutions.com",',
        '  "variables": {',
        '    "name": "Valued Customer",',
        '    "amount": "2,100",',
        '    "transaction_id": "854575376539",',
        '    "event": "Lucky Draw",',
        '    "status": "CREDITED",',
        '    "payment_mode": "UPI"',
        '  }',
        '}',
        '',
        '1. CRITICAL: For general inquiries, outreach, property notices, cancellations, invitations, follow-ups, or custom prompts, you MUST generate thorough, high-impact corporate copywriting in "body_text" using clean semantic HTML tags (<p>, <strong>, <ul>, <li>). NEVER leave body_text blank or generic ("Please find details below"). Address the user prompt with complete professional context and clarity.',
        '2. "subject": Write a high-converting, professional subject line strictly reflecting the user prompt (e.g. "Important Notice: Assigned Plot Cancellation — SVI Infra Solutions"). NEVER use generic "Official Communication" unless the user prompt has no specific topic.',
        '3. "badge": 2-4 word uppercase/title badge for the header banner (e.g. "Plot Cancellation", "Allotment Update", "Payment Acknowledgment").',
        '4. "subtitle": A crisp corporate subtitle describing the communication.',
        '5. "cta_text": Contextual action button (e.g. "Connect With Advisor", "Schedule Site Visit", "Explore Properties", or empty string if no CTA is needed).',
        '6. "cta_url": Website link (defaults to "https://www.sviinfrasolutions.com").',
        '7. Escape all quotes inside strings as \\" and do not put raw literal unescaped newlines inside JSON string values.',
        '7. For refunds: emailType = refund_confirmation. Set status = "CREDITED" always for refund emails.',
        '8. For payments received: emailType = payment_confirmation. Set status = "RECEIVED" always for payment emails.',
        '9. Extract UTR / Transaction ID from any UTR number, TXN ID, reference number, or 10-18 digit numeric code in the prompt.',
        '10. Extract Event / Scheme from phrases like "lucky draw", "diwali scheme", "allotment", etc.',
        '11. For bookings or allotments: emailType = booking_confirmation.',
        '12. For payment dues or reminders: emailType = payment_reminder.',
        '13. For everything else: emailType = general.',
        '14. For payment_mode: if prompt mentions UPI/gpay/phonepe/paytm → "UPI", bank/NEFT/RTGS/IMPS → "Bank Transfer", cash → "Cash", card → "Card Payment", one-time/onetime → "One-Time Payment".',
        '15. If subject or prompt matches an EXISTING TEMPLATE set action = template_match and provide that templateId. Otherwise action = ai_template.',
        '16. Respond with ONLY the JSON object. No explanation, no markdown fences.',
        '',
        'RECIPIENT DATA:',
        JSON.stringify(recipientData),
        '',
        'EMAIL SUBJECT:',
        subject || 'General Correspondence',
        '',
        'USER PROMPT:',
        userPrompt || 'Draft an appropriate professional email.',
        '',
        `Tone: ${tone || 'Professional'}`,
      ].join('\n');
      let extractedText = '';
      try {
        extractedText = await safeGenerateText({
          system:
            'You are a JSON data extractor. Output ONLY valid JSON. No markdown, no HTML, no explanation.',
          prompt: extractPrompt,
          maxOutputTokens: 2500,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'AI service temporarily unavailable';
        return NextResponse.json(
          { error: `AI generation failed: ${msg}. Please try again.` },
          { status: 503 }
        );
      }

      // ── Step 2: Parse extracted vars with resilient fallback ───────────────
      const extracted = parseAutoComposeJson(extractedText, userPrompt, subject);
      const emailType: EmailTemplateType = extracted.emailType || 'general';

      // Clean extracted variables: strip any placeholder patterns (<...>, {{...}}, [...], dummy strings)
      const cleanVar = (val: unknown): string => {
        if (typeof val !== 'string') return '';
        const trimmed = val.trim();
        if (
          (trimmed.startsWith('<') && trimmed.endsWith('>')) ||
          (trimmed.startsWith('{{') && trimmed.endsWith('}}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          /^n\/?a$/i.test(trimmed) ||
          /^(none|null|undefined|unknown|placeholder)$/i.test(trimmed)
        ) {
          return '';
        }
        return trimmed;
      };

      const rawVars = extracted.variables || {};
      const cleanedVars: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawVars)) {
        const cleaned = cleanVar(v);
        if (cleaned) cleanedVars[k] = cleaned;
      }

      // Deterministic regex fallbacks from prompt (catches numbers & phrases LLM might miss)
      const promptText = `${userPrompt || ''} ${subject || ''}`;

      // Amount fallback
      if (!cleanedVars.amount) {
        const amountMatch =
          promptText.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
          promptText.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:₹|rs\.?|inr|rupees|\/-)/i) ||
          promptText.match(/\b([1-9]\d{2,6})\b/);
        if (amountMatch) {
          const num = parseFloat(amountMatch[1].replace(/,/g, ''));
          if (!isNaN(num) && num > 0) cleanedVars.amount = num.toLocaleString('en-IN');
        }
      }

      // Transaction ID / UTR fallback (explicit prefix OR 10-18 digit standalone sequence)
      if (!cleanedVars.transaction_id) {
        const utrExplicit = promptText.match(
          /(?:utr|txn(?:id)?|transaction(?:\s*id)?|ref(?:erence)?(?:\s*id|\s*no)?)[\s#:=-]*([A-Za-z0-9]{8,24})/i
        );
        if (utrExplicit) {
          cleanedVars.transaction_id = utrExplicit[1].trim();
        } else {
          const longNum = promptText.match(/\b([0-9]{10,18})\b/);
          if (longNum && longNum[1] !== (cleanedVars.amount || '').replace(/,/g, '')) {
            cleanedVars.transaction_id = longNum[1].trim();
          }
        }
      }

      // Event fallback
      if (!cleanedVars.event) {
        const eventMatch = promptText.match(
          /\b(lucky\s*draw|diwali\s*(?:offer|scheme)?|monsoon\s*(?:offer|scheme)?|allotment(?:\s*draw)?)\b/i
        );
        if (eventMatch) {
          cleanedVars.event = eventMatch[1].trim().replace(/\b\w/g, (c) => c.toUpperCase());
        }
      }

      // Payment mode fallback
      if (!cleanedVars.payment_mode) {
        if (/upi|gpay|google\s*pay|phonepe|paytm/i.test(promptText))
          cleanedVars.payment_mode = 'UPI';
        else if (/neft|rtgs|imps|net\s*banking|bank\s*transfer/i.test(promptText))
          cleanedVars.payment_mode = 'Bank Transfer';
        else if (/\bcash\b/i.test(promptText)) cleanedVars.payment_mode = 'Cash';
        else if (/\bcard\b|debit|credit/i.test(promptText))
          cleanedVars.payment_mode = 'Card Payment';
      }

      // Status default
      if (emailType === 'refund_confirmation' && !cleanedVars.status) {
        cleanedVars.status = 'CREDITED';
      } else if (emailType === 'payment_confirmation' && !cleanedVars.status) {
        cleanedVars.status = 'RECEIVED';
      }

      const vars: LuxuryEmailVars = {
        portal_url: 'https://www.sviinfrasolutions.com',
        badge: extracted.badge,
        subtitle: extracted.subtitle,
        body_text: extracted.body_text,
        cta_text: extracted.cta_text,
        cta_url: extracted.cta_url,
        prompt: userPrompt,
        ...cleanedVars,
        subject: extracted.subject || subject || 'Official Communication',
      };
      type EmailTpl = { id: string; name: string; subject: string; html: string };
      let matchedTpl: EmailTpl | null = null;
      if (extracted.action === 'template_match' && extracted.templateId) {
        matchedTpl =
          (emailTemplates as EmailTpl[]).find(
            (t) =>
              t.id === extracted.templateId ||
              t.name.toLowerCase() === (extracted.templateName || '').toLowerCase()
          ) ?? null;
      }

      let finalHtml: string;
      let finalAction: string;
      let finalTemplateId: string;
      let finalTemplateName: string;
      let finalSubject: string;

      if (matchedTpl) {
        // Substitute extracted vars into the template so placeholders become real values
        const varsForSubstitution: Record<string, string> = {};
        Object.entries(vars).forEach(([k, v]) => {
          if (v && typeof v === 'string' && v.trim()) varsForSubstitution[k] = v;
        });
        const substitutedHtml = getPreviewHtml(matchedTpl.html, varsForSubstitution);
        finalHtml = sanitizeEmailHtml(substitutedHtml || matchedTpl.html);
        finalAction = 'template_match';
        finalTemplateId = matchedTpl.id;
        finalTemplateName = matchedTpl.name;
        finalSubject = extracted.subject || matchedTpl.subject;
      } else {
        // ── Step 4: Build complete luxury HTML server-side ─────────────────
        finalHtml = buildLuxuryEmailHtml(emailType, vars);
        finalAction = 'ai_template';
        finalTemplateId = '_ai_generated';
        finalTemplateName = extracted.templateName || 'AI Generated';
        finalSubject = extracted.subject || subject || 'Official Communication';
      }

      return NextResponse.json({
        success: true,
        action: finalAction,
        templateId: finalTemplateId,
        templateName: finalTemplateName,
        subject: finalSubject,
        variables: vars,
        html: finalHtml,
      });
    }

    // ─── Feature 1: Generate email content (streaming) ─────
    if (action === 'generate') {
      const { prompt, tone, context } = body;
      if (!prompt) {
        return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
      }

      const toneInstruction = tone ? `Tone: ${tone}.` : 'Tone: Professional.';
      const contextInfo = context?.recipientName ? `Recipient: ${context.recipientName}.` : '';
      const subjectInfo = context?.subject ? `Email subject: ${context.subject}.` : '';

      try {
        const result = streamText({
          model: groq(PRIMARY_MODEL),
          system: `You are an elite business email writer for SVI Infra Solutions.
Write a clear, professional, and directly usable HTML email body based on the prompt.
Rules:
- Output clean semantic HTML tags (<p>, <ul>, <li>, <strong>, <br>).
- Do NOT output markdown code blocks or fences like \`\`\`html.
- Do NOT include Subject headers or metadata.
- Make the email engaging, concise, and appropriate for corporate real estate communication.`,
          prompt: `${toneInstruction} ${contextInfo} ${subjectInfo}\n\nWrite an email message addressing this prompt:\n"${prompt}"\n\nReturn the HTML body directly:`,
        });
        return result.toTextStreamResponse();
      } catch {
        const result = streamText({
          model: groq(FALLBACK_MODEL),
          system: `You are an elite business email writer for SVI Infra Solutions.
Write a clear, professional, and directly usable HTML email body based on the prompt.`,
          prompt: `${toneInstruction} ${contextInfo} ${subjectInfo}\n\nWrite an email message addressing this prompt:\n"${prompt}"\n\nReturn the HTML body directly:`,
        });
        return result.toTextStreamResponse();
      }
    }

    // ─── Feature 2: Improve email content (streaming) ──────
    if (action === 'improve') {
      const { html, instruction } = body;
      if (!html) {
        return NextResponse.json({ error: 'Missing html content' }, { status: 400 });
      }

      const instructionText = instruction
        ? `Specific instruction: ${instruction}`
        : 'General improvement for grammar, tone, and clarity.';

      try {
        const result = streamText({
          model: groq(PRIMARY_MODEL),
          system: IMPROVE_PROMPT,
          prompt: `${instructionText}\n\nOriginal email HTML:\n${html}`,
        });
        return result.toTextStreamResponse();
      } catch {
        const result = streamText({
          model: groq(FALLBACK_MODEL),
          system: IMPROVE_PROMPT,
          prompt: `${instructionText}\n\nOriginal email HTML:\n${html}`,
        });
        return result.toTextStreamResponse();
      }
    }

    // ─── Feature 3: Summarize email thread (non-streaming) ─
    if (action === 'summarize') {
      const { emails } = body;
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json({ error: 'Missing emails array' }, { status: 400 });
      }

      const threadText = emails
        .map(
          (e: any, i: number) =>
            `--- Email ${i + 1} ---\nFrom: ${e.from || 'Unknown'}\nSubject: ${e.subject || '(no subject)'}\nDate: ${e.created_at || 'Unknown'}\nContent:\n${stripHtml(e.html || e.text || '')}`
        )
        .join('\n\n');

      const text = await safeGenerateText({
        system: SUMMARIZE_PROMPT,
        prompt: `Summarize this email thread:\n\n${threadText}`,
      });

      const summary = safeParseJson(text, {
        overview: stripHtml(threadText).slice(0, 300),
        keyPoints: [],
        actionItems: [],
      });
      return NextResponse.json({ success: true, summary });
    }

    // ─── Feature 4: Populate template variables (non-streaming) ─
    if (action === 'populate_template') {
      const { templateId, variables, recipientEmail } = body;
      if (!variables || !Array.isArray(variables)) {
        return NextResponse.json({ error: 'Missing variables array' }, { status: 400 });
      }

      // Fetch recipient data if email provided
      let recipientData: Record<string, any> = {};
      if (recipientEmail) {
        recipientData = await fetchRecipientData(recipientEmail);
      }

      const text = await safeGenerateText({
        system: POPULATE_TEMPLATE_PROMPT,
        prompt: `Template ID: ${templateId || 'unknown'}\n\nVariables to populate:\n${variables.join(', ')}\n\nRecipient data:\n${JSON.stringify(recipientData, null, 2)}`,
      });

      const parsed = safeParseJson<Record<string, unknown>>(text, {});
      const suggestions =
        typeof parsed.suggestions === 'object' && parsed.suggestions !== null
          ? parsed.suggestions
          : parsed;
      const confidence = typeof parsed.confidence === 'string' ? parsed.confidence : 'medium';
      return NextResponse.json({
        success: true,
        suggestions,
        confidence,
      });
    }

    // ─── Feature 5: Sentiment analysis (non-streaming) ─────
    if (action === 'analyze_sentiment') {
      const { emailHtml, emailText } = body;
      if (!emailHtml && !emailText) {
        return NextResponse.json({ error: 'Missing email content' }, { status: 400 });
      }

      const content = stripHtml(emailHtml || '') || emailText || '';

      const text = await safeGenerateText({
        system: SENTIMENT_PROMPT,
        prompt: `Analyze this email:\n\n${content}`,
      });

      const result = safeParseJson(text, {
        sentiment: 'neutral',
        score: 0.5,
        summary: 'Standard correspondence',
        suggestedResponses: ['Thank you for your email. We will review and revert back soon.'],
      });
      return NextResponse.json({ success: true, ...result });
    }

    // ─── Feature 6: Suggest Subject Lines ─────
    if (action === 'suggest_subject') {
      const { html } = body;
      if (!html) return NextResponse.json({ error: 'Missing html' }, { status: 400 });

      const text = await safeGenerateText({
        system:
          'You are an email subject line expert for SVI Infra Solutions, a real estate company.',
        prompt: `Analyze this email body and suggest exactly 3 professional subject lines.
Return ONLY a JSON array of strings, no other text.
Make them specific to real estate (property, payment, allotment, site visit, etc.).
Keep each under 60 characters.

Email body:
${stripHtml(html)}`,
      });

      let suggestions = safeParseJson<string[]>(text, []);
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        suggestions = text
          .split('\n')
          .map((l) =>
            l
              .replace(/^[0-9-.*"]+\s*/, '')
              .replace(/[",]+$/, '')
              .trim()
          )
          .filter((l) => l.length > 5 && l.length < 80)
          .slice(0, 3);
      }
      if (suggestions.length === 0) {
        suggestions = ['Important Communication from SVI Infra Solutions'];
      }
      return NextResponse.json({
        success: true,
        suggestions: suggestions.slice(0, 3),
      });
    }

    // ─── Feature 7: Classify Email (priority + category) ─────
    if (action === 'classify_email') {
      const { emailHtml, emailText } = body;
      if (!emailHtml && !emailText)
        return NextResponse.json({ error: 'Missing content' }, { status: 400 });

      const content = stripHtml(emailHtml || '') || emailText || '';

      const text = await safeGenerateText({
        system: 'You classify real estate emails for SVI Infra Solutions admin team.',
        prompt: `Classify this email and return JSON:
{
  "priority": "high" | "medium" | "low",
  "category": "Payment" | "Allotment" | "Site Visit" | "Complaint" | "Inquiry" | "Other",
  "summary": "one line summary"
}

Rules:
- high priority: payment overdue, complaints, cancellations, urgent requests
- medium priority: payment inquiries, allotment questions, site visit requests
- low priority: general inquiries, marketing, informational

Email:
${content.slice(0, 3000)}`,
      });

      const result = safeParseJson(text, {
        priority: 'medium',
        category: 'Inquiry',
        summary: 'Customer correspondence',
      });
      return NextResponse.json({ success: true, ...result });
    }

    // ─── Feature 8: Suggest Follow-up Date ─────
    if (action === 'suggest_followup') {
      const { html, recipientName } = body;
      if (!html) return NextResponse.json({ error: 'Missing html' }, { status: 400 });

      const text = await safeGenerateText({
        system: 'You suggest follow-up timing for SVI Infra Solutions real estate emails.',
        prompt: `Analyze this sent email and suggest when to follow up.
Return JSON:
{
  "suggestedDays": number,
  "reason": "brief reason",
  "message": "one sentence follow-up suggestion for the admin"
}

Rules:
- Payment reminders: follow up in 3-5 days
- Site visit follow-ups: 2-3 days
- Allotment/legal: 5-7 days
- General inquiries: 3-4 days
- Urgent/complaints: 1-2 days

Recipient: ${recipientName || 'Unknown'}

Email content:
${stripHtml(html)}`,
      });

      const result = safeParseJson(text, {
        suggestedDays: 3,
        reason: 'Standard follow-up for client confirmation',
        message: 'Follow up with client within 3 days to verify status.',
      });
      return NextResponse.json({ success: true, ...result });
    }

    // ─── Feature 9: Generate / Refine Custom Email Template ─────
    if (action === 'generate_custom_template') {
      const {
        prompt: userPrompt,
        name: suggestedName,
        category: suggestedCategory,
        tone = 'Luxury Executive',
        currentHtml,
        refinementInstruction,
      } = body;

      if (!userPrompt && !refinementInstruction) {
        return NextResponse.json(
          { error: 'Prompt or refinement instruction is required' },
          { status: 400 }
        );
      }

      let aiPrompt = '';
      if (currentHtml && refinementInstruction) {
        aiPrompt = `You are an elite corporate email HTML template designer for SVI Infra Solutions Pvt. Ltd.
You are tasked with refining an existing custom email template according to the instruction.

CURRENT TEMPLATE HTML:
${currentHtml}

REFINEMENT INSTRUCTION:
${refinementInstruction}

CRITICAL REQUIREMENTS:
1. Maintain the executive Obsidian/Gold luxury visual design of SVI Infra Solutions.
2. Official SVI Logo: Ensure <img src="https://www.sviinfrasolutions.com/logo.png" alt="SVI Infra Solutions" width="145" height="auto" style="display:block;max-height:36px;border:0;" /> is inside a white capsule in the dark header banner.
3. Keep dynamic template placeholders clean with double curly braces (e.g. {{name}}, {{plot_no}}, {{project}}).
4. SVI Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309. SVI Helpdesk: +91 73000-07643.
5. Return ONLY a single valid JSON object, NO markdown formatting:
{
  "name": "${suggestedName || 'Updated Custom Template'}",
  "subject": "Refined subject line",
  "category": "${suggestedCategory || 'Custom'}",
  "description": "Short 1-sentence description",
  "html": "<!DOCTYPE html><html>...</html>",
  "variables": ["name", "plot_no"]
}`;
      } else {
        aiPrompt = `You are an elite corporate email HTML template designer and developer for SVI Infra Solutions Pvt. Ltd. (premier real estate developer in India).
Generate a complete, fully-responsive, executive-grade corporate email HTML template based on this request:

USER SPECIFICATION:
"${userPrompt}"

PARAMETERS:
- Suggested Name: ${suggestedName || 'Auto-generate a crisp, professional real estate template name'}
- Category: ${suggestedCategory || 'Sales & Offers'}
- Tone: ${tone}

CRITICAL DESIGN & STRUCTURE REQUIREMENTS:
1. Layout: Max 600px responsive table card, centered on subtle grey background (#f1f5f9), white card body (#ffffff) with rounded corners (16px) and subtle box shadow.
2. Header:
   - Deep luxury Obsidian gradient banner (background: linear-gradient(135deg, #07111e 0%, #0d1e36 50%, #0a1628 100%)) with bottom gold accent border (border-bottom: 3px solid #D4AF37).
   - Official SVI Corporate Logo: <div style="display:inline-block;background-color:#ffffff;padding:8px 22px;border-radius:24px;box-shadow:0 4px 14px rgba(0,0,0,0.25);margin-bottom:14px;"><img src="https://www.sviinfrasolutions.com/logo.png" alt="SVI Infra Solutions" width="145" height="auto" style="display:block;max-height:36px;border:0;" /></div>
   - Category pill: High-contrast gold badge (background: rgba(212,175,55,0.15); border: 1px solid #D4AF37; border-radius: 20px; color: #D4AF37; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 14px; display: inline-block;).
   - Crisp subtitle text in light silver (#e2e8f0).
3. Body Content:
   - Polished Indian English, professional real estate business copywriting.
   - Salutation: "Dear {{name}}," (or appropriate recipient variable).
   - Rich, clear paragraphs.
   - Highlight section / Key detail box (e.g. Plot dimensions, Project Name, Investment details, Discount breakdown, or Schedule).
   - Prominent Call-to-Action button in luxury gold gradient (background: linear-gradient(135deg,#D4AF37 0%,#f3e5ab 50%,#b08f36 100%); color: #0f172a; padding: 12px 32px; border-radius: 25px; text-decoration: none; font-weight: 800; font-size: 12px; text-transform: uppercase;) or inquiry card.
4. Dynamic Variables:
   - Use standard mustache variables with double braces: e.g. {{name}}, {{plot_no}}, {{project_name}}, {{amount}}, {{due_date}}, {{discount_percent}}, {{advisor_name}}, {{phone}}, etc.
   - NEVER put HTML inside the double curly braces (e.g. use <strong>{{plot_no}}</strong>, NEVER {{<strong>plot_no</strong>}}).
5. Footer:
   - SVI Helpdesk Bar: SVI Helpdesk: +91 73000-07643 &bull; info@sviinfrasolutions.com
   - Full Corporate Footer: SVI Infra Solutions Pvt. Ltd.<br>Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309<br>Official Website: www.sviinfrasolutions.com
6. Output Format:
   - Respond ONLY with a valid JSON object.
   - DO NOT include markdown code fences (\`\`\`json or \`\`\`).
   - JSON Schema:
{
  "name": "Template Name",
  "subject": "Email Subject Line with {{variable}} if appropriate",
  "category": "Sales & Offers | Customer Relations | Legal & Allotment | Payment | Festival & Offers | HR & Operations",
  "description": "1-sentence summary of the template",
  "html": "<!DOCTYPE html><html>...</html>",
  "variables": ["name", "plot_no", "project_name"]
}`;
      }

      const generatedRaw = await safeGenerateText({
        system: EMAIL_SYSTEM_PROMPT,
        prompt: aiPrompt,
        maxOutputTokens: 3500,
      });

      const parsed = parseCustomTemplateOutput(generatedRaw, suggestedName, userPrompt);
      const cleanHtml = sanitizeEmailHtml(parsed.html);
      const detectedVars = extractTemplateVars(cleanHtml);
      const combinedVars = Array.from(new Set([...(parsed.variables || []), ...detectedVars]));

      return NextResponse.json({
        success: true,
        template: {
          name: parsed.name,
          subject: parsed.subject,
          category: parsed.category,
          description: parsed.description,
          html: cleanHtml,
          variables: combinedVars,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * Highly resilient parser for auto_compose AI output.
 * Handles unescaped literal newlines in strings, unescaped quotes, markdown wraps,
 * and guarantees a prompt-informed body_text so generic placeholders are never shown.
 */
function parseAutoComposeJson(
  rawText: string,
  userPrompt: string,
  fallbackSubject = ''
): {
  action: 'template_match' | 'ai_template';
  templateId: string;
  templateName: string;
  subject: string;
  emailType: EmailTemplateType;
  badge: string;
  subtitle: string;
  body_text: string;
  cta_text: string;
  cta_url: string;
  variables: LuxuryEmailVars;
} {
  let cleaned = (rawText || '').trim();

  // Strip markdown code fences
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: any = null;
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      parsed = JSON.parse(candidate);
    } catch {
      try {
        const sanitized = candidate.replace(/(:\s*"(?:[^"\\]|\\.)*")/g, (m) =>
          m.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
        );
        parsed = JSON.parse(sanitized);
      } catch {
        // Fall through to regex extraction
      }
    }
  }

  const getField = (name: string): string => {
    if (parsed && typeof parsed === 'object' && parsed[name]) {
      return String(parsed[name]).trim();
    }
    const m = cleaned.match(new RegExp(`"${name}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'i'));
    if (m) {
      try {
        return JSON.parse('"' + m[1] + '"').trim();
      } catch {
        return m[1].replace(/\\"/g, '"').trim();
      }
    }
    if (name === 'body_text') {
      const m2 = cleaned.match(/"body_text"\s*:\s*"([\s\S]*?)"\s*(?:,\s*"|\s*\})/);
      if (m2) {
        return m2[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
      }
    }
    return '';
  };

  const action = (parsed?.action ||
    cleaned.match(/"action"\s*:\s*"(template_match|ai_template)"/i)?.[1] ||
    'ai_template') as 'template_match' | 'ai_template';
  const templateId =
    parsed?.templateId || cleaned.match(/"templateId"\s*:\s*"([^"]+)"/i)?.[1] || '_ai_generated';
  const templateName = getField('templateName') || 'Official Notice';
  let subject = getField('subject');
  const emailType = (parsed?.emailType ||
    cleaned.match(/"emailType"\s*:\s*"([^"]+)"/i)?.[1] ||
    'general') as EmailTemplateType;
  let badge = getField('badge');
  let subtitle = getField('subtitle');
  let body_text = getField('body_text');
  let cta_text = getField('cta_text');
  const cta_url = getField('cta_url') || 'https://www.sviinfrasolutions.com';
  const variables =
    parsed?.variables && typeof parsed.variables === 'object' ? parsed.variables : {};

  // Check if body_text is empty or contains the generic fallback phrase
  const isGeneric =
    !body_text ||
    /please find the details of your communication below/i.test(body_text) ||
    body_text.trim().length < 15;

  if (isGeneric && userPrompt && userPrompt.trim()) {
    const p = userPrompt.trim();
    const lower = p.toLowerCase();

    if (lower.includes('cancel') || lower.includes('cancelled') || lower.includes('canceled')) {
      badge = badge || 'Plot Cancellation Notice';
      subtitle = subtitle || 'Important Notice Regarding Assigned Plot Allocation';
      subject = subject || 'Important Notice: Assigned Plot Cancellation — SVI Infra Solutions';
      body_text = `<p>We are writing to formally inform you that the plot allocation previously assigned to you has been cancelled.</p><p>For further details regarding your file, accounting status, or to explore alternative available options with priority allocation, please connect with your assigned property advisor immediately.</p>`;
      cta_text = cta_text || 'Connect with Advisor';
    } else {
      badge = badge || 'Official Notice';
      subtitle = subtitle || 'SVI Infra Solutions — Corporate Notice';
      subject =
        subject ||
        (fallbackSubject && fallbackSubject !== 'Official Communication'
          ? fallbackSubject
          : 'Official Communication — SVI Infra Solutions');
      body_text = `<p>${p.replace(/\n+/g, '</p><p>')}</p>`;
      cta_text = cta_text || 'Contact SVI Support';
    }
  }

  if (!badge) badge = 'Official Communication';
  if (!subtitle) subtitle = 'SVI Infra Solutions — Corporate Notice';
  if (!subject) subject = fallbackSubject || 'Official Communication — SVI Infra Solutions';

  return {
    action,
    templateId,
    templateName,
    subject,
    emailType,
    badge,
    subtitle,
    body_text,
    cta_text,
    cta_url,
    variables,
  };
}
// ─── Helpers ─────────────────────────────────────────────────

/**
 * Safely parse AI auto-compose responses with error resilience against
 * unescaped newlines, markdown codeblock wraps, and escaped quotes.
 */
function parseAutoComposeOutput(
  rawText: string,
  fallbackSubject = ''
): {
  action: 'template_match' | 'ai_template';
  subject: string;
  templateId: string;
  templateName: string;
  variables: Record<string, string>;
  html: string;
} {
  let cleaned = (rawText || '').trim();

  // Strip markdown code fences
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // 1. Direct JSON parse attempt on outermost object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonCandidate);
      if (parsed && typeof parsed === 'object') {
        return {
          action: parsed.action || 'ai_template',
          subject: (parsed.subject || fallbackSubject || '').trim(),
          templateId: parsed.templateId || '_ai_generated',
          templateName: (parsed.templateName || 'AI Generated').trim(),
          variables:
            typeof parsed.variables === 'object' && parsed.variables !== null
              ? parsed.variables
              : {},
          html: sanitizeEmailHtml(parsed.html || ''),
        };
      }
    } catch {
      // Direct JSON parse failed, proceed to resilient extraction
    }
  }

  // 2. Resilient regex extraction of individual fields
  let action: 'template_match' | 'ai_template' = 'ai_template';
  const actionMatch = cleaned.match(/"action"\s*:\s*"(template_match|ai_template)"/i);
  if (actionMatch) action = actionMatch[1] as any;

  let templateId = '_ai_generated';
  const idMatch = cleaned.match(/"templateId"\s*:\s*"([^"]+)"/i);
  if (idMatch) templateId = idMatch[1].trim();

  let templateName = 'AI Generated';
  const nameMatch = cleaned.match(/"templateName"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
  if (nameMatch) {
    try {
      templateName = JSON.parse('"' + nameMatch[1] + '"').trim();
    } catch {
      templateName = nameMatch[1].replace(/\\"/g, '"').trim();
    }
  }

  let subject = fallbackSubject;
  const subjMatch = cleaned.match(/"subject"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
  if (subjMatch) {
    try {
      subject = JSON.parse('"' + subjMatch[1] + '"').trim();
    } catch {
      subject = subjMatch[1].replace(/\\"/g, '"').trim();
    }
  }

  let variables: Record<string, string> = {};
  const varsMatch = cleaned.match(/"variables"\s*:\s*(\{[\s\S]*?\})/);
  if (varsMatch) {
    try {
      variables = JSON.parse(varsMatch[1]);
    } catch {
      const pairRegex = /"([^"]+)"\s*:\s*"([^"]*)"/g;
      let m: RegExpExecArray | null;
      while ((m = pairRegex.exec(varsMatch[1])) !== null) {
        variables[m[1]] = m[2];
      }
    }
  }

  // Extract HTML
  let rawHtml = '';
  const htmlPropMatch = cleaned.match(/"html"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (htmlPropMatch) {
    try {
      rawHtml = JSON.parse('"' + htmlPropMatch[1] + '"');
    } catch {
      rawHtml = htmlPropMatch[1];
    }
  } else {
    const docMatch =
      cleaned.match(/<!DOCTYPE[\s\S]*<\/html>/i) || cleaned.match(/<table[\s\S]*<\/table>/i);
    if (docMatch) {
      rawHtml = docMatch[0];
    }
  }

  return {
    action,
    subject: subject || fallbackSubject,
    templateId,
    templateName,
    variables,
    html: sanitizeEmailHtml(rawHtml),
  };
}

/** Build a summary of email templates for AI to match against */
function getTemplatesSummary(): string {
  return (emailTemplates as Array<{ id: string; name: string; subject: string; category?: string }>)
    .map((t) => `- id: ${t.id} | name: ${t.name} | subject: ${t.subject}`)
    .join('\n');
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchRecipientData(email: string): Promise<Record<string, any>> {
  const data: Record<string, any> = { email };

  try {
    // Check profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (profile) {
      data.name = profile.full_name || profile.name;
      data.phone = profile.phone;
      data.full_name = profile.full_name;
    }

    // Check registrations table
    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (registration) {
      data.registration = registration;
      data.project = registration.project || registration.property_interest;
      data.property_type = registration.property_type;
      data.property_size = registration.property_size;
      data.submission_id = registration.submission_id;
      data.advisor_name = registration.advisor_name;
    }

    // Check allotment_records for this email's user
    const { data: allotment } = await supabaseAdmin
      .from('allotment_records')
      .select('*')
      .eq('form_data->>clientEmail', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (allotment) {
      const fd = allotment.form_data || {};
      data.allotment = fd;
      data.clientName = fd.clientName;
      data.projectName = fd.projectName;
      data.unitNumber = fd.unitNumber;
      data.area = fd.area;
      data.bsp = fd.bsp;
      data.ticketId = fd.ticketId;
    }

    // Check receipt_records
    const { data: receipt } = await supabaseAdmin
      .from('receipt_records')
      .select('*')
      .eq('form_data->>email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (receipt) {
      data.receipt = receipt.form_data;
    }

    // Check payment_records
    const { data: payment } = await supabaseAdmin
      .from('payment_records')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (payment) {
      data.payment = payment;
    }
  } catch (err) {
    console.error('[AI] Error fetching recipient data:', err);
  }

  return data;
}

/**
 * Resilient parser for custom template AI responses.
 * Extracts JSON properties with regex fallbacks if the HTML body contains tricky unescaped characters.
 */
function parseCustomTemplateOutput(
  rawText: string,
  fallbackName = '',
  fallbackSubject = ''
): {
  name: string;
  subject: string;
  category: string;
  description: string;
  html: string;
  variables: string[];
} {
  let cleaned = (rawText || '').trim();

  // Strip markdown code fences
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // 1. Direct JSON parse attempt on outermost object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonCandidate);
      if (parsed && typeof parsed === 'object') {
        const detectedHtml = (parsed.html || '').trim();
        const varsArray = Array.isArray(parsed.variables)
          ? parsed.variables
              .map((v: unknown) => String(v).replace(/[{}]/g, '').trim())
              .filter(Boolean)
          : [];
        return {
          name: (parsed.name || fallbackName || 'Custom Template').trim(),
          subject: (parsed.subject || fallbackSubject || 'SVI Infra Solutions Update').trim(),
          category: (parsed.category || 'Sales & Offers').trim(),
          description: (parsed.description || 'Custom SVI Infra corporate template').trim(),
          html: detectedHtml,
          variables: varsArray,
        };
      }
    } catch {
      // Fall through to regex extraction
    }
  }

  // 2. Resilient regex extraction
  let name = fallbackName || 'Custom Template';
  const nameMatch = cleaned.match(/"name"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
  if (nameMatch) {
    try {
      name = JSON.parse('"' + nameMatch[1] + '"').trim();
    } catch {
      name = nameMatch[1].replace(/\\"/g, '"').trim();
    }
  }

  let subject = fallbackSubject || 'SVI Infra Solutions Update';
  const subjMatch = cleaned.match(/"subject"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
  if (subjMatch) {
    try {
      subject = JSON.parse('"' + subjMatch[1] + '"').trim();
    } catch {
      subject = subjMatch[1].replace(/\\"/g, '"').trim();
    }
  }

  let category = 'Sales & Offers';
  const catMatch = cleaned.match(/"category"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
  if (catMatch) {
    try {
      category = JSON.parse('"' + catMatch[1] + '"').trim();
    } catch {
      category = catMatch[1].replace(/\\"/g, '"').trim();
    }
  }

  let description = 'Custom SVI Infra corporate template';
  const descMatch = cleaned.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
  if (descMatch) {
    try {
      description = JSON.parse('"' + descMatch[1] + '"').trim();
    } catch {
      description = descMatch[1].replace(/\\"/g, '"').trim();
    }
  }

  let html = '';
  const htmlMatch = cleaned.match(/"html"\s*:\s*"([\s\S]*?)"\s*(?:,\s*"|\s*})/);
  if (htmlMatch) {
    try {
      html = JSON.parse('"' + htmlMatch[1] + '"');
    } catch {
      html = htmlMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, ' ');
    }
  } else {
    const docStart = cleaned.indexOf('<!DOCTYPE');
    const htmlStart = docStart !== -1 ? docStart : cleaned.indexOf('<table');
    if (htmlStart !== -1) {
      const htmlEnd = cleaned.lastIndexOf('</html>');
      if (htmlEnd !== -1) {
        html = cleaned.slice(htmlStart, htmlEnd + 7);
      } else {
        html = cleaned.slice(htmlStart);
      }
    }
  }

  return {
    name,
    subject,
    category,
    description,
    html,
    variables: [],
  };
}
