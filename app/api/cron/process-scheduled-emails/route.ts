import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { Resend } from 'resend';

export async function GET(request: Request) {
  // Optional: Verify the request using Vercel Cron secret
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    const resend = new Resend(apiKey);

    // Fetch pending emails that are due to be sent
    const { data: pendingEmails, error: fetchError } = await supabaseAdmin
      .from('scheduled_emails')
      .select('*')
      .lte('scheduled_at', new Date().toISOString())
      .eq('status', 'pending');

    if (fetchError) {
      console.error('Error fetching scheduled emails:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    let processedCount = 0;

    for (const email of pendingEmails) {
      // Mark as processing immediately to prevent duplicate sends
      await supabaseAdmin
        .from('scheduled_emails')
        .update({ status: 'processing' })
        .eq('id', email.id);

      // Fetch attachments
      const { data: attachmentsData } = await supabaseAdmin
        .from('email_attachments')
        .select('*')
        .eq('email_id', email.id);

      let resendAttachments: any[] | undefined = undefined;

      if (attachmentsData && attachmentsData.length > 0) {
        resendAttachments = [];
        for (const att of attachmentsData) {
          if (att.url) {
            try {
              // Fetch content from public URL to send via Resend
              const attRes = await fetch(att.url);
              if (attRes.ok) {
                const arrayBuffer = await attRes.arrayBuffer();
                const content = Buffer.from(arrayBuffer).toString('base64');
                resendAttachments.push({
                  filename: att.filename,
                  content: content,
                });
              }
            } catch (err) {
              console.error(
                `Failed to fetch attachment ${att.filename} for email ${email.id}`,
                err
              );
            }
          }
        }
      }

      // Parse reply_to: may be comma-separated string, normalize to array
      const parseReplyTo = (val: string | undefined | null): string[] | undefined => {
        if (!val) return undefined;
        const parts = String(val)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        return parts.length > 0 ? parts : undefined;
      };

      // Send email via Resend
      const result = await resend.emails.send({
        from: email.metadata?.from || 'SVI Infra <noreply@sviiinfrasolutions.com>',
        to: email.to_emails,
        cc: email.cc_emails || undefined,
        bcc: email.bcc_emails || undefined,
        subject: email.subject,
        html: email.html_body,
        replyTo: parseReplyTo(email.reply_to),
        headers: email.in_reply_to
          ? {
              'In-Reply-To': email.in_reply_to,
              References: email.in_reply_to,
            }
          : undefined,
        attachments: resendAttachments,
      });

      if (result.error) {
        console.error(`Failed to send scheduled email ${email.id}:`, result.error);
        await supabaseAdmin
          .from('scheduled_emails')
          .update({
            status: 'failed',
            metadata: { ...email.metadata, error: result.error.message },
          })
          .eq('id', email.id);
      } else {
        const sentNow = new Date().toISOString();
        await supabaseAdmin
          .from('scheduled_emails')
          .update({
            status: 'sent',
            sent_at: sentNow,
          })
          .eq('id', email.id);

        // ── Permanent Archive in email_messages ──
        try {
          await supabaseAdmin.from('email_messages').insert({
            resend_id: (result as any).data?.id || `sched-${email.id}`,
            subject: email.subject,
            from_email: email.metadata?.from || 'SVI Infra <noreply@sviiinfrasolutions.com>',
            to_emails: email.to_emails,
            status: 'sent',
            last_event: 'delivered',
            sent_at: sentNow,
            created_at: sentNow,
            metadata: {
              html: email.html_body,
              text: email.html_body,
              cc: email.cc_emails || [],
              bcc: email.bcc_emails || [],
              reply_to: email.reply_to || null,
              attachments: resendAttachments,
              source: 'scheduled_emails',
            },
          });
        } catch (archiveErr) {
          console.error('Failed to permanently archive scheduled email:', archiveErr);
        }

        processedCount++;
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
