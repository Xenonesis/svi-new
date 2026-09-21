import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
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
    if (!admin) throw AppError.unauthorized();

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
        'You are an email data extractor for SVI Infra Solutions.',
        '',
        'EXISTING TEMPLATES:',
        templatesList,
        '',
        'TASK:',
        'Analyze the user prompt and extract structured data. Respond ONLY with valid JSON.',
        '',
        'OUTPUT SCHEMA:',
        '{',
        '  "action": "template_match" or "ai_template",',
        '  "templateId": "<id from list if matched, else _ai_generated>",',
        '  "templateName": "<2-4 word title>",',
        '  "subject": "<crisp email subject line>",',
        '  "emailType": "refund_confirmation" or "payment_confirmation" or "booking_confirmation" or "payment_reminder" or "general",',
        '  "variables": {',
        '    "name": "<recipient name or Valued Customer>",',
        '    "amount": "<numeric amount without rupee symbol e.g. 2,100>",',
        '    "transaction_id": "<transaction id or UTR number>",',
        '    "event": "<event or scheme name>",',
        '    "status": "<CREDITED or RECEIVED or CONFIRMED>",',
        '    "payment_mode": "<Bank Transfer or UPI or Cash>",',
        '    "project": "<project name if booking>",',
        '    "unit_no": "<unit or plot number if booking>",',
        '    "plot_size": "<plot size if booking>",',
        '    "booking_date": "<booking date if booking>",',
        '    "body_text": "<one-sentence summary for general emails>",',
        '    "portal_url": "https://www.sviinfrasolutions.com"',
        '  }',
        '}',
        '',
        'RULES:',
        'Extract ONLY values actually mentioned in the prompt. OMIT fields entirely (do not include the key) if the value is not mentioned.',
        'For refunds: emailType = refund_confirmation. Set status = "CREDITED" always for refund emails.',
        'For payments received: emailType = payment_confirmation. Set status = "RECEIVED" always for payment emails.',
        'For bookings or allotments: emailType = booking_confirmation',
        'For payment dues or reminders: emailType = payment_reminder',
        'For everything else: emailType = general',
        'For payment_mode: if prompt mentions UPI/gpay/phonepe/paytm → "UPI", bank/NEFT/RTGS/IMPS → "Bank Transfer", cash → "Cash", card → "Card Payment", one-time/onetime → "One-Time Payment".',
        'If subject or prompt matches an EXISTING TEMPLATE set action = template_match and provide that templateId.',
        'Otherwise set action = ai_template.',
        "IMPORTANT: Do NOT match lucky_draw or other event templates for refund/payment emails. Only match templates when the prompt is explicitly about that template's purpose.",
        'Respond with ONLY the JSON object. No explanation, no markdown fences.',
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
          maxOutputTokens: 600,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'AI service temporarily unavailable';
        return NextResponse.json(
          { error: `AI generation failed: ${msg}. Please try again.` },
          { status: 503 }
        );
      }

      // ── Step 2: Parse extracted vars ───────────────────────────────────────
      type ExtractedPayload = {
        action: 'template_match' | 'ai_template';
        templateId: string;
        templateName: string;
        subject: string;
        emailType: EmailTemplateType;
        variables: LuxuryEmailVars;
      };
      const extracted = safeParseJson<ExtractedPayload>(extractedText, {
        action: 'ai_template',
        templateId: '_ai_generated',
        templateName: 'AI Generated',
        subject: subject || 'Official Communication',
        emailType: 'general',
        variables: { name: 'Valued Customer', portal_url: 'https://www.sviinfrasolutions.com' },
      });

      const emailType: EmailTemplateType = extracted.emailType || 'general';
      const vars: LuxuryEmailVars = {
        portal_url: 'https://www.sviinfrasolutions.com',
        ...extracted.variables,
        subject: extracted.subject || subject || 'Official Communication',
      };

      // ── Step 3: Check for existing template match ──────────────────────────
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

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
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
