import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { streamText, generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import emailTemplates from '@/src/data/email-templates.json';

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

const AI_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

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

    // ─── Auto Compose: subject / prompt → template match or AI corporate template ───
    if (action === 'auto_compose') {
      const { subject, prompt: userPrompt, tone, to } = body;
      if (!subject && !userPrompt) {
        return NextResponse.json({ error: 'Missing subject or prompt' }, { status: 400 });
      }

      // Fetch recipient context if email provided
      let recipientData: Record<string, any> = {};
      if (to) {
        recipientData = await fetchRecipientData(to);
      }

      // Build existing templates list for AI to match against
      const templatesList = getTemplatesSummary();

      const prompt = `You are an elite email HTML template designer for SVI Infra Solutions, a luxury real estate developer in India.

EXISTING TEMPLATES:
${templatesList}

─── LUXURY MOBILE-RESPONSIVE CORPORATE DESIGN SYSTEM ───
Always construct email with this clean, 100% mobile-responsive HTML email architecture:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>SVI Infra Solutions</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 12px 6px !important; }
      .email-card { width: 100% !important; max-width: 100% !important; border-radius: 12px !important; }
      .header-cell { padding: 24px 16px !important; }
      .header-title { font-size: 20px !important; line-height: 1.3 !important; }
      .header-subtitle { font-size: 12px !important; }
      .body-cell { padding: 22px 16px !important; font-size: 14px !important; }
      .details-table th, .details-table td { padding: 8px 10px !important; font-size: 12px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 14px 18px !important; }
      .helpdesk-bar { padding: 14px 16px !important; font-size: 11.5px !important; }
      .footer-cell { padding: 18px 12px !important; font-size: 11px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0;padding:28px 10px;background-color:#f1f5f9;width:100%;">
    <tr>
      <td align="center">
        <!-- Main Card Container: Fluid 100% with max-width 600px -->
        <table class="email-card" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid #e2e8f0;margin:0 auto;">
          <!-- Header Banner with Official Corporate Logo -->
          <tr class="header-row" style="background-color:#07111e;background:linear-gradient(135deg,#07111e 0%,#0d1e36 50%,#0a1628 100%);border-bottom:2px solid #D4AF37;">
            <td class="header-cell" style="padding:28px 24px 22px;text-align:center;">
              <div style="background:#ffffff;display:inline-block;padding:6px 14px;border-radius:8px;box-shadow:0 3px 12px rgba(0,0,0,0.3);margin-bottom:12px;">
                <img src="https://www.sviinfrasolutions.com/logo.png" alt="SVI Infra Solutions" width="160" style="height:36px;width:auto;max-height:40px;display:block;margin:0 auto;border:0;" />
              </div>
              <div style="margin-bottom:6px;">
                <span class="header-pill" style="display:inline-block;padding:3px 12px;background:rgba(212,175,55,0.12);border:1px solid rgba(212,175,55,0.4);border-radius:16px;color:#D4AF37 !important;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">OFFICIAL NOTICE / CATEGORY</span>
              </div>
              <h1 class="header-title" style="color:#ffffff !important;font-size:20px;margin:0;font-family:Georgia,serif;font-weight:700;letter-spacing:0.5px;line-height:1.35;">Email Subject / Heading</h1>
              <p class="header-subtitle" style="color:#cbd5e1 !important;font-size:11.5px;margin:4px 0 0;font-weight:400;line-height:1.4;">SVI INFRA SOLUTIONS PVT. LTD.</p>
            </td>
          </tr>

<!-- Body Content (inside <td class="email-body-content" style="padding:32px 28px;background-color:#ffffff;color:#0f172a;">) -->
  - Salutation (MUST BE CRISP, HIGH-CONTRAST DARK TEXT #0f172a, NEVER LIGHT OR FAINT):
    * If request from Employee to HR/Management: <h2 style="color:#0f172a !important;font-size:16px;margin:0 0 16px;font-weight:700;line-height:1.4;">Respected Sir/Madam,</h2> (or Dear Management,)
    * If Company to Customer: <h2 style="color:#0f172a !important;font-size:16px;margin:0 0 16px;font-weight:700;line-height:1.4;">Dear {{name}},</h2>
    * If Company to Employee: <h2 style="color:#0f172a !important;font-size:16px;margin:0 0 16px;font-weight:700;line-height:1.4;">Dear {{name}},</h2>
  - Main text paragraphs:
    <p style="color:#334155 !important;font-size:14px;line-height:1.75;margin:0 0 16px;">Paragraph content addressing user prompt directly with professional spacing...</p>

  - CONDITIONAL ELEMENTS (ONLY include when explicitly justified or requested):
    * Key-Value / Application Details Table: When displaying structured facts (e.g. status, dates, amounts, targets).
      CRITICAL: Every <th> and <td> MUST have explicit inline border and padding styles so it renders perfectly across all clients!
      Values must be REAL concrete values or executive status badges, NEVER generic phrases like 'Status' or 'Variable Name'.
      <table class="details-table" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:18px 0;overflow:hidden;font-size:13px;">
        <thead>
          <tr style="background-color:#0f172a;"><th colspan="2" style="padding:10px 14px;text-align:left;font-weight:700;color:#ffffff !important;border:1px solid #0f172a;font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px;">Summary Details</th></tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#475569;font-weight:600;width:38%;border:1px solid #e2e8f0;background-color:#f8fafc;">Client Form</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;border:1px solid #e2e8f0;background-color:#ffffff;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;background-color:#fee2e2;color:#991b1b;border:1px solid #fecaca;font-size:11px;font-weight:700;">Pending</span></td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#475569;font-weight:600;border:1px solid #e2e8f0;background-color:#f8fafc;">Allotment Amount</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;border:1px solid #e2e8f0;background-color:#ffffff;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;background-color:#fee2e2;color:#991b1b;border:1px solid #fecaca;font-size:11px;font-weight:700;">Awaited</span></td></tr>
          <tr><td style="padding:10px 14px;color:#475569;font-weight:600;border:1px solid #e2e8f0;background-color:#f8fafc;">Target Completion</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;border:1px solid #e2e8f0;background-color:#ffffff;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;background-color:#fffbeb;color:#92400e;border:1px solid #fde68a;font-size:11px;font-weight:700;">Incomplete</span></td></tr>
        </tbody>
      </table>

    * Highlight/Alert Box (SEMANTIC COLORS):
      - For Warnings / Disciplinary Notices / Salary Holds / Suspensions:
        <div style="background-color:#fff1f2;border:1px solid #fecdd3;border-left:4px solid #e11d48;border-radius:8px;padding:13px 16px;margin:18px 0;">
          <p style="margin:0;color:#9f1239;font-weight:700;font-size:13px;line-height:1.5;">Important Notice: Attendance suspension and salary hold will remain in effect until compliance.</p>
        </div>
      - For Approvals / Positive Confirmations:
        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:8px;padding:13px 16px;margin:18px 0;">
          <p style="margin:0;color:#15803d;font-weight:700;font-size:13px;line-height:1.5;">✓ Confirmation: Details have been approved and updated.</p>
        </div>
      - For General Informational Notices:
        <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0f172a;border-radius:8px;padding:13px 16px;margin:18px 0;">
          <p style="margin:0;color:#0f172a;font-weight:700;font-size:13px;line-height:1.5;">Notice: Please take note of the policy requirements.</p>
        </div>

    * Action Roadmap / Next Steps: STRICTLY PROHIBITED unless the USER INSTRUCTIONS / PROMPT explicitly asks for next steps or action points.
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin:20px 0;">
        <h3 style="margin:0 0 10px;color:#0f172a;font-size:13.5px;font-weight:700;">📌 Required Action Steps:</h3>
        <ol style="margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:1.8;">
          <li>...specific steps from user prompt...</li>
        </ol>
      </div>

    * CTA Button: STRICTLY PROHIBITED unless the USER INSTRUCTIONS / PROMPT explicitly requests a button, portal link, or call-to-action.
      <div style="text-align:center;margin:24px 0 16px;">
        <a href="{{portal_url}}" class="cta-button" style="background-color:#D4AF37;background:linear-gradient(135deg,#D4AF37 0%,#f3e5ab 50%,#b08f36 100%);color:#0f172a;padding:13px 30px;border-radius:26px;text-decoration:none;font-weight:800;font-size:12.5px;display:inline-block;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(212,175,55,0.35);text-transform:uppercase;min-height:42px;line-height:16px;">Action Button</a>
      </div>

  - Sign-off (Clean professional sign-off):
    <div style="margin:22px 0 0;color:#334155;font-size:13.5px;line-height:1.6;">Warm regards,<br><strong style="color:#0f172a;">HR & Operations Team</strong><br><span style="color:#64748b;font-size:12px;">SVI Infra Solutions Pvt. Ltd.</span></div>

- Advisor / Helpdesk Bar:
  <div class="helpdesk-bar" style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 20px;font-size:12px;color:#64748b;word-break:break-word;">
    <strong style="color:#0f172a;">Need assistance?</strong> SVI Helpdesk: <a href="tel:+917300007643" style="color:#0f172a;font-weight:700;text-decoration:none;">+91-73000-07643</a> &bull; <a href="mailto:info@sviinfrasolutions.com" style="color:#D4AF37;text-decoration:none;">info@sviinfrasolutions.com</a>
  </div>
- Corporate Legal Footer:
  <div class="footer-cell" style="padding:18px 16px;text-align:center;background-color:#f8fafc;border-top:1px solid #cbd5e1;word-break:break-word;">
    <p style="color:#0f172a !important;font-size:12.5px;font-weight:800;letter-spacing:0.3px;margin:0 0 4px;">SVI Infra Solutions Pvt. Ltd.</p>
    <p style="color:#475569 !important;font-size:11.5px;margin:0 0 5px;line-height:1.5;font-weight:500;">Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309 &bull; <a href="https://www.sviinfrasolutions.com" style="color:#1e3a8a !important;font-weight:700;text-decoration:underline;">www.sviinfrasolutions.com</a></p>
    <p style="color:#64748b !important;font-size:10.5px;margin:0;font-weight:600;">&copy; ${new Date().getFullYear()} SVI Infra Solutions. All rights reserved.</p>
  </div>
CRITICAL RULES:
- DO NOT include 'Next Steps' or 'View Details on Portal' CTA buttons by default. Only generate them if the user's prompt explicitly asks for next steps or a portal action button.
- The official logo MUST be included in the header banner using https://www.sviinfrasolutions.com/logo.png.
- Tables MUST have explicit borders on every cell. Status values must be formatted as badges (Pending, Awaited, Approved, etc.).
TASK:
Analyze the email subject, user instructions/prompt, requested tone (${tone || 'Professional'}), and recipient details.
1) If the subject/prompt matches one of the EXISTING TEMPLATES above, output a JSON object:
{
  "action": "template_match",
  "subject": "<matching template subject with relevant placeholders, or refined subject line>",
  "templateId": "<matching template id from list>",
  "templateName": "<matching template name>",
  "variables": {
    "name": "<recipient name or Valued Customer>",
    "<other template variables>": "<value or placeholder>"
  },
  "html": "<complete email HTML with variables filled or placeholders>"
}

2) If NO MATCH with existing templates, create a custom, high-end, responsive HTML email template using the EXACT luxury structure above:
{
  "action": "ai_template",
  "subject": "<crisp, executive, and punchy email subject line accurately summarizing the email intent>",
  "templateId": "_ai_generated",
  "templateName": "<short 2-4 word descriptive title>",
  "variables": {
    "name": "<recipient name or Valued Customer>",
    "<other custom variables>": "<value or placeholder>"
  },
  "html": "<!DOCTYPE html><html>...complete valid HTML email...</html>"
}
RECIPIENT DATA:
${JSON.stringify(recipientData, null, 2)}

EMAIL SUBJECT:
${subject || 'General Correspondence'}

USER INSTRUCTIONS / PROMPT:
${userPrompt || 'Draft an appropriate professional email response based on the subject and recipient context.'}

IMPORTANT: Respond with ONLY a valid JSON object matching the schema above. No markdown code blocks, no explanation text.`;

      const { text } = await generateText({
        model: groq(AI_MODEL),
        system: EMAIL_SYSTEM_PROMPT,
        prompt,
      });

      try {
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/```\s*$/, '')
            .trim();
        }

        let parsed: any;
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Failed to parse AI response JSON');
          }
        }
        let matchedTpl: any = null;
        if (parsed.action === 'template_match' && parsed.templateId) {
          matchedTpl = (emailTemplates as Array<any>).find(
            (t) =>
              t.id === parsed.templateId ||
              t.name.toLowerCase() === (parsed.templateName || '').toLowerCase()
          );
          if (matchedTpl) {
            parsed.templateId = matchedTpl.id;
            parsed.templateName = matchedTpl.name;
            if (!parsed.html) parsed.html = matchedTpl.html;
          } else {
            parsed.action = 'ai_template';
            parsed.templateId = '_ai_generated';
          }
        }

        let finalSubject = parsed.subject || '';
        if (!finalSubject && parsed.action === 'template_match' && matchedTpl?.subject) {
          finalSubject = matchedTpl.subject;
        }
        return NextResponse.json({
          success: true,
          action: parsed.action || 'ai_template',
          templateId: parsed.templateId || '_ai_generated',
          templateName: parsed.templateName || 'AI Generated',
          subject: finalSubject,
          variables: parsed.variables || {},
          html: parsed.html || '',
        });
      } catch (parseErr: any) {
        console.error('[AI] Auto compose parsing failed:', parseErr, text);
        const htmlMatch =
          text.match(/<!DOCTYPE[\s\S]*<\/html>/i) || text.match(/<table[\s\S]*<\/table>/i);
        if (htmlMatch) {
          return NextResponse.json({
            success: true,
            action: 'ai_template',
            templateId: '_ai_generated',
            templateName: 'AI Generated',
            variables: {},
            html: htmlMatch[0],
          });
        }
        return NextResponse.json(
          { error: 'Failed to generate auto compose template' },
          { status: 500 }
        );
      }
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

      const result = streamText({
        model: groq(AI_MODEL),
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

      const result = streamText({
        model: groq(AI_MODEL),
        system: IMPROVE_PROMPT,
        prompt: `${instructionText}\n\nOriginal email HTML:\n${html}`,
      });

      return result.toTextStreamResponse();
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

      const { text } = await generateText({
        model: groq(AI_MODEL),
        system: SUMMARIZE_PROMPT,
        prompt: `Summarize this email thread:\n\n${threadText}`,
      });

      // Parse JSON response
      try {
        const summary = JSON.parse(text);
        return NextResponse.json({ success: true, summary });
      } catch {
        // Try extracting JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const summary = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, summary });
        }
        return NextResponse.json({ error: 'Failed to parse summary' }, { status: 500 });
      }
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

      const { text } = await generateText({
        model: groq(AI_MODEL),
        system: POPULATE_TEMPLATE_PROMPT,
        prompt: `Template ID: ${templateId || 'unknown'}\n\nVariables to populate:\n${variables.join(', ')}\n\nRecipient data:\n${JSON.stringify(recipientData, null, 2)}`,
      });

      try {
        const result = JSON.parse(text);
        return NextResponse.json({ success: true, ...result });
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, ...result });
        }
        return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 });
      }
    }

    // ─── Feature 5: Sentiment analysis (non-streaming) ─────
    if (action === 'analyze_sentiment') {
      const { emailHtml, emailText } = body;
      if (!emailHtml && !emailText) {
        return NextResponse.json({ error: 'Missing email content' }, { status: 400 });
      }

      const content = stripHtml(emailHtml || '') || emailText || '';

      const { text } = await generateText({
        model: groq(AI_MODEL),
        system: SENTIMENT_PROMPT,
        prompt: `Analyze this email:\n\n${content}`,
      });

      try {
        const result = JSON.parse(text);
        return NextResponse.json({ success: true, ...result });
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, ...result });
        }
        return NextResponse.json({ error: 'Failed to parse sentiment analysis' }, { status: 500 });
      }
    }

    // ─── Feature 6: Suggest Subject Lines ─────
    if (action === 'suggest_subject') {
      const { html } = body;
      if (!html) return NextResponse.json({ error: 'Missing html' }, { status: 400 });

      const { text } = await generateText({
        model: groq(AI_MODEL),
        system:
          'You are an email subject line expert for SVI Infra Solutions, a real estate company.',
        prompt: `Analyze this email body and suggest exactly 3 professional subject lines.
Return ONLY a JSON array of strings, no other text.
Make them specific to real estate (property, payment, allotment, site visit, etc.).
Keep each under 60 characters.

Email body:
${stripHtml(html)}`,
      });

      try {
        const suggestions = JSON.parse(text);
        return NextResponse.json({
          success: true,
          suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 3) : [],
        });
      } catch {
        const arrMatch = text.match(/\[[\s\S]*?\]/);
        if (arrMatch) {
          const suggestions = JSON.parse(arrMatch[0]);
          return NextResponse.json({
            success: true,
            suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 3) : [],
          });
        }
        return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 });
      }
    }

    // ─── Feature 7: Classify Email (priority + category) ─────
    if (action === 'classify_email') {
      const { emailHtml, emailText } = body;
      if (!emailHtml && !emailText)
        return NextResponse.json({ error: 'Missing content' }, { status: 400 });

      const content = stripHtml(emailHtml || '') || emailText || '';

      const { text } = await generateText({
        model: groq(AI_MODEL),
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

      try {
        const result = JSON.parse(text);
        return NextResponse.json({ success: true, ...result });
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return NextResponse.json({ success: true, ...JSON.parse(jsonMatch[0]) });
        return NextResponse.json({ error: 'Failed to classify' }, { status: 500 });
      }
    }

    // ─── Feature 8: Suggest Follow-up Date ─────
    if (action === 'suggest_followup') {
      const { html, recipientName } = body;
      if (!html) return NextResponse.json({ error: 'Missing html' }, { status: 400 });

      const { text } = await generateText({
        model: groq(AI_MODEL),
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

      try {
        const result = JSON.parse(text);
        return NextResponse.json({ success: true, ...result });
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return NextResponse.json({ success: true, ...JSON.parse(jsonMatch[0]) });
        return NextResponse.json({ error: 'Failed to suggest follow-up' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
}

// ─── Helpers ─────────────────────────────────────────────────

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
