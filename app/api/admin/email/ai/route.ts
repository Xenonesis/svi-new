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

const EMAIL_SYSTEM_PROMPT = `You are an AI email writing assistant for SVI Infra Solutions Pvt. Ltd., a premium real estate developer in India.
Write professional business emails in Indian English. Be clear, courteous, and property-focused.
- Use respectful salutations (Dear/Respected)
- Keep paragraphs concise
- End with a professional sign-off
- Use ₹ for currency
- Reference SVI Infra's projects when relevant
- Maintain a warm yet professional tone throughout
- Important Context: The current year is ${new Date().getFullYear()} and our official website is https://www.sviinfrasolutions.com`;

const IMPROVE_PROMPT = `You are an email editor. Improve the given email HTML for grammar, tone, clarity, and professionalism.
- Preserve the original meaning and all factual details
- Keep the HTML structure intact
- Fix grammar and spelling errors
- Improve sentence flow and readability
- Make the tone more professional if needed
- Return ONLY the improved HTML, nothing else`;

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

    // ─── Auto Compose: subject → template match or AI-generated ───
    if (action === 'auto_compose') {
      const { subject, to } = body;
      if (!subject) {
        return NextResponse.json({ error: 'Missing subject' }, { status: 400 });
      }

      // Fetch recipient context if email provided
      let recipientData: Record<string, any> = {};
      if (to) {
        recipientData = await fetchRecipientData(to);
      }

      // Build existing templates list for AI to match against
      const templatesList = getTemplatesSummary();

      const prompt = `You are an email HTML template generator for SVI Infra Solutions, a premium real estate developer in India.

EXISTING TEMPLATES:
${templatesList}

─── COLOR & DESIGN SYSTEM ───
- Header gradient: linear-gradient(135deg,#1a2744,#2d4080)
- Gold accent: #D4AF37
- Navy text: #1a2744
- Body text: #555555
- Footer bg: #f9f9f9, text: #999999
- Button: bg #D4AF37, text #1a2744, radius 8px
- Use ₹ for Indian Rupee currency.
- Use {{variable_name}} for dynamic values (e.g. {{name}}, {{property_name}}, {{amount}}, {{due_date}}, {{portal_url}}).

TASK:
Analyze the email subject and recipient details.
1) If the subject matches one of the EXISTING TEMPLATES above, output a JSON object:
{
  "action": "template_match",
  "templateId": "<matching template id from list>",
  "templateName": "<matching template name>",
  "variables": {
    "name": "<recipient name or Valued Customer>",
    "<other template variables>": "<value or placeholder>"
  },
  "html": "<complete email HTML with variables or placeholders>"
}

2) If NO MATCH with existing templates, create a custom, high-end, responsive HTML email template using table layout:
{
  "action": "ai_template",
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
${subject}

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

        if (parsed.action === 'template_match' && parsed.templateId) {
          const tpl = (emailTemplates as Array<any>).find(
            (t) =>
              t.id === parsed.templateId ||
              t.name.toLowerCase() === (parsed.templateName || '').toLowerCase()
          );
          if (tpl) {
            parsed.templateId = tpl.id;
            parsed.templateName = tpl.name;
            if (!parsed.html) parsed.html = tpl.html;
          } else {
            parsed.action = 'ai_template';
            parsed.templateId = '_ai_generated';
          }
        }

        return NextResponse.json({
          success: true,
          action: parsed.action || 'ai_template',
          templateId: parsed.templateId || '_ai_generated',
          templateName: parsed.templateName || 'AI Generated',
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

      const toneInstruction = tone ? `Write in a ${tone} tone.` : 'Write in a professional tone.';

      const contextInfo = context?.recipientName ? `Recipient: ${context.recipientName}.` : '';
      const subjectInfo = context?.subject ? `Email subject: ${context.subject}.` : '';

      const result = streamText({
        model: groq(AI_MODEL),
        system: EMAIL_SYSTEM_PROMPT,
        prompt: `${toneInstruction} ${contextInfo} ${subjectInfo}\n\nWrite an email body for: ${prompt}\n\nReturn ONLY the email body HTML (no subject line, no explanation).`,
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
