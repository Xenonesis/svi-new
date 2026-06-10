import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { AppError, handleApiError } from '@/src/lib/api/errors';

const STORAGE_BUCKET = 'registration-docs';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(emailStr: string): boolean {
  if (!emailStr) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
}

async function sendEmailWithRetry(
  resend: any,
  payload: any,
  maxRetries = 3,
  initialDelay = 1000
): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      const result = await resend.emails.send(payload);
      if (result.error) throw new Error(result.error.message || 'Resend API error');
      console.log(`[Email] Sent on attempt ${attempt} (ID: ${result.data?.id})`);
      return result;
    } catch (err: any) {
      console.error(`[Email] Attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxRetries) throw err;
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function uploadFile(
  file: File,
  folder: string
): Promise<{ path: string; url: string } | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error('File upload error:', error.message);
    return null;
  }
  const { data } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(fileName, 60 * 60 * 24 * 7);
  return { path: fileName, url: data?.signedUrl ?? '' };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 registrations per IP per minute
    const limited = rateLimit(request, { limit: 3, windowSeconds: 60 });
    if (limited) return limited;

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw AppError.badRequest('Invalid form data');
    }

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const mobileNo = formData.get('mobileNo') as string;
    const email = formData.get('email') as string;
    const soWoDo = formData.get('soWoDo') as string;
    const dob = formData.get('dob') as string;
    const aadharNumber = formData.get('aadharNumber') as string;
    const panNumber = formData.get('panNumber') as string;
    const state = formData.get('state') as string;
    const city = formData.get('city') as string;
    const address = formData.get('address') as string;
    const advisorName = formData.get('advisorName') as string;
    const project = formData.get('project') as string;
    const propertySize = formData.get('propertySize') as string;
    const propertyType = formData.get('propertyType') as string;
    const plotPreference = formData.get('plotPreference') as string;
    const paymentPlan = formData.get('paymentPlan') as string;
    const paymentMode = formData.get('paymentMode') as string;
    const schemeAmount = formData.get('schemeAmount') as string;

    if (
      !firstName ||
      !mobileNo ||
      !email ||
      !soWoDo ||
      !dob ||
      !aadharNumber ||
      !state ||
      !city ||
      !address ||
      !advisorName ||
      !project ||
      !propertySize ||
      !propertyType ||
      !plotPreference ||
      !paymentPlan ||
      !paymentMode ||
      !schemeAmount
    ) {
      throw AppError.badRequest('All required fields must be filled');
    }

    const photoFile = formData.get('photo') as File | null;
    const panCardFile = formData.get('panCard') as File | null;
    const MAX_FILE_SIZE = 150 * 1024;
    const ALLOWED_MIME_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (photoFile && photoFile.size > 0) {
      if (photoFile.size > MAX_FILE_SIZE)
        throw AppError.badRequest('Photo file size must be under 150KB');
      if (!ALLOWED_MIME_TYPES.includes(photoFile.type))
        throw AppError.badRequest('Only JPG, PNG, WEBP, or PDF allowed for photos');
    }
    if (panCardFile && panCardFile.size > 0) {
      if (panCardFile.size > MAX_FILE_SIZE)
        throw AppError.badRequest('PAN Card file size must be under 150KB');
      if (!ALLOWED_MIME_TYPES.includes(panCardFile.type))
        throw AppError.badRequest('Only JPG, PNG, WEBP, or PDF allowed for PAN Card');
    }

    let photoUrl: string | null = null;
    let panCardFileUrl: string | null = null;
    if (photoFile && photoFile.size > 0) {
      const result = await uploadFile(photoFile, 'photos');
      if (!result) throw AppError.internal('Failed to upload photo');
      photoUrl = result.url;
    }
    if (panCardFile && panCardFile.size > 0) {
      const result = await uploadFile(panCardFile, 'pan-cards');
      if (!result) throw AppError.internal('Failed to upload PAN card');
      panCardFileUrl = result.url;
    }

    let data: any = null;
    let success = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts && !success) {
      attempts++;
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('registrations')
        .select('submission_id')
        .not('submission_id', 'is', null)
        .order('submission_id', { ascending: false })
        .limit(1);

      if (fetchError) throw AppError.internal('Database error during ID generation');

      let nextId = 'SVI2200';
      if (existing && existing.length > 0 && existing[0].submission_id) {
        const match = existing[0].submission_id.match(/^SVI(\d+)$/);
        if (match) {
          const nextNumeric = parseInt(match[1], 10) + 1;
          nextId = `SVI${String(nextNumeric).padStart(Math.max(4, match[1].length), '0')}`;
        }
      }

      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('registrations')
        .insert({
          name: firstName,
          last_name: lastName || null,
          email,
          phone: mobileNo,
          so_wo_do: soWoDo,
          preferred_date: dob || null,
          aadhar_number: aadharNumber,
          pan_number: panNumber || null,
          photo_url: photoUrl,
          pan_card_file_url: panCardFileUrl,
          state,
          city,
          address,
          advisor_name: advisorName,
          project,
          property_size: propertySize,
          property_type: propertyType,
          plot_preference: plotPreference,
          payment_plan: paymentPlan,
          payment_mode: paymentMode,
          scheme_amount: schemeAmount,
          property_interest: project,
          submission_id: nextId,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          console.warn(
            `[Registration] Collision on ID ${nextId}, retry ${attempts}/${maxAttempts}`
          );
          continue;
        }
        throw AppError.internal('Failed to submit registration');
      }
      data = insertedData;
      success = true;
    }

    if (!success) throw AppError.internal('Concurrent registration conflict. Please try again.');

    console.log(
      `[Registration] Submission ID: ${data.submission_id} for ${firstName} at ${data.created_at || new Date().toISOString()}`
    );

    // Send email notification (non-blocking)
    const emailStatus = { sent: false, error: null as string | null };
    let primaryRecipient = email;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        let adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
        let sendUserCopy = true;
        let bccAdvisor = true;
        let notifyOnRegistration = true;
        let senderName = 'SVI Infra';
        let senderEmail = 'noreply@sviiinfrasolutions.com';
        let retryAttempts = 3;

        try {
          const { data: emailSetting } = await supabaseAdmin
            .from('portal_settings')
            .select('value')
            .eq('key', 'email_settings')
            .single();
          if (emailSetting?.value && typeof emailSetting.value === 'object') {
            const val = emailSetting.value as any;
            if (val.admin_email) adminEmail = val.admin_email;
            if (val.send_user_copy !== undefined) sendUserCopy = !!val.send_user_copy;
            if (val.bcc_advisor !== undefined) bccAdvisor = !!val.bcc_advisor;
            if (val.notify_on_registration !== undefined)
              notifyOnRegistration = !!val.notify_on_registration;
            if (val.sender_name) senderName = val.sender_name;
            if (val.sender_email) senderEmail = val.sender_email;
            if (typeof val.retry_attempts === 'number') retryAttempts = val.retry_attempts;
          }
        } catch (settingsErr) {
          console.warn('[Registration] Failed to load email settings:', settingsErr);
        }

        if (!notifyOnRegistration) {
          console.log('[Registration] Email alerts disabled in settings.');
          emailStatus.sent = false;
          emailStatus.error = 'Disabled in settings';
          return NextResponse.json({
            success: true,
            id: data.id,
            submissionId: data.submission_id,
            emailStatus,
          });
        }

        let advisorEmail: string | null = null;
        if (advisorName) {
          try {
            const { data: advProfile } = await supabaseAdmin
              .from('profiles')
              .select('email, real_email')
              .eq('full_name', advisorName)
              .limit(1);
            if (advProfile && advProfile.length > 0) {
              advisorEmail = advProfile[0].real_email || advProfile[0].email;
            }
          } catch (advisorErr) {
            console.error('[Registration] Failed to lookup advisor:', advisorErr);
          }
        }

        const bccList: string[] = [];
        let isFallbackRoute = false;

        if (sendUserCopy) {
          primaryRecipient = email;
          if (!isValidEmail(email)) {
            primaryRecipient = adminEmail;
            isFallbackRoute = true;
          } else if (isValidEmail(adminEmail)) {
            bccList.push(adminEmail);
          }
        } else {
          primaryRecipient = adminEmail;
          isFallbackRoute = true;
        }

        if (bccAdvisor && advisorEmail && isValidEmail(advisorEmail)) {
          bccList.push(advisorEmail);
        }

        const emailHtmlContent = `
          <div style="font-family: sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eaeaea;border-radius:10px;background:#fff;">
            <div style="text-align:right;margin-bottom:15px;">
              <span style="background:#c9a84c;color:#fff;font-size:9px;font-weight:bold;padding:4px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:1px;">
                ✨ System Automated Notification
              </span>
            </div>
            <h2 style="color:#c9a84c;font-family:serif;border-bottom:2px solid #f0d080;padding-bottom:10px;">
              ${isFallbackRoute ? 'Admin Record: Property Registration' : 'Registration Acknowledgment'}
            </h2>
            <p>Dear <strong>${escapeHtml(firstName)} ${escapeHtml(lastName || '')}</strong>,</p>
            <p>Thank you for registering with SVI Infra Solutions.</p>
            <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #c9a84c;">
              <h3 style="margin-top:0;">Submission Details</h3>
              <table style="border-collapse:collapse;width:100%;font-size:13px;">
                <tr><td style="padding:6px 0;font-weight:bold;width:40%">Submission ID:</td><td style="padding:6px 0">${data.submission_id}</td></tr>
                <tr><td style="padding:6px 0;font-weight:bold">Project:</td><td style="padding:6px 0">${escapeHtml(project)}</td></tr>
                <tr><td style="padding:6px 0;font-weight:bold">Type & Size:</td><td style="padding:6px 0">${escapeHtml(propertyType)} (${escapeHtml(propertySize)})</td></tr>
                <tr><td style="padding:6px 0;font-weight:bold">Advisor:</td><td style="padding:6px 0">${escapeHtml(advisorName)}</td></tr>
                <tr><td style="padding:6px 0;font-weight:bold">Amount:</td><td style="padding:6px 0">INR ${escapeHtml(schemeAmount)}</td></tr>
              </table>
            </div>
            <p style="font-size:13px;">Our advisor will contact you shortly.</p>
            <hr style="border:none;border-top:1px solid #eaeaea;"/>
            <p style="font-size:11px;color:#888;text-align:center;">SVI Infra Solutions Pvt. Ltd.</p>
          </div>`;

        const emailPayload: any = {
          from: `${senderName} <${senderEmail}>`,
          to: primaryRecipient,
          subject: `[SYSTEM-AUTO] Registration: ${firstName} ${lastName || ''} - ${data.submission_id}`,
          html: emailHtmlContent,
          headers: {
            'X-Auto-Response': 'true',
            'X-System-Generated': 'true',
            'X-SVI-Event': 'property_registration',
          },
          tags: [
            { name: 'category', value: 'system_automation' },
            { name: 'event', value: 'property_registration' },
          ],
        };

        if (bccList.length > 0) {
          const uniqueBcc = bccList.filter(
            (a) => a.toLowerCase() !== primaryRecipient.toLowerCase()
          );
          if (uniqueBcc.length > 0) emailPayload.bcc = uniqueBcc;
        }

        await sendEmailWithRetry(resend, emailPayload, retryAttempts);
        emailStatus.sent = true;

        try {
          await NotificationHelper.emailDispatched(
            primaryRecipient,
            emailPayload.subject,
            data.submission_id
          );
        } catch (notifErr) {
          console.error('[Registration] Email dispatch log failed:', notifErr);
        }
      }
    } catch (emailErr: any) {
      console.error('[Registration] Email failed:', emailErr);
      emailStatus.error = emailErr.message;
      try {
        await NotificationHelper.emailDispatchFailed(
          primaryRecipient,
          emailStatus.error || 'Unknown',
          data.submission_id
        );
      } catch (notifErr) {
        console.error('[Registration] Failure log failed:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      submissionId: data.submission_id,
      emailStatus,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/registration — retrieve active advisor names
export async function GET(request: NextRequest) {
  try {
    const { data: settingData, error: settingError } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', 'active_advisors')
      .single();

    if (
      settingError ||
      !settingData?.value ||
      typeof settingData.value !== 'object' ||
      !('ids' in settingData.value) ||
      !Array.isArray(settingData.value.ids) ||
      settingData.value.ids.length === 0
    ) {
      return NextResponse.json({ advisors: [] });
    }

    const advisorIds: string[] = settingData.value.ids;
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .in('id', advisorIds);

    if (profilesError) throw AppError.internal('Failed to fetch advisors');

    const advisorNames = (profiles || [])
      .map((p) => p.full_name)
      .sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ advisors: advisorNames });
  } catch (error) {
    return handleApiError(error);
  }
}
