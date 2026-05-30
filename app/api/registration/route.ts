import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

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
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(emailStr);
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
      if (result.error) {
        throw new Error(result.error.message || 'Resend API returned an error');
      }
      console.log(
        `[Email Audit] Email sent successfully on attempt ${attempt} (ID: ${result.data?.id})`
      );
      return result;
    } catch (err: any) {
      console.error(`[Email Audit Error] Attempt ${attempt} failed: ${err.message || err}`);
      if (attempt >= maxRetries) {
        throw err;
      }
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`[Email Audit] Retrying in ${delay}ms...`);
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
    .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

  return { path: fileName, url: data?.signedUrl ?? '' };
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
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

  // Validate required fields
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
    return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
  }

  // Handle file uploads with strict server-side validation (max 150KB, safe formats)
  const photoFile = formData.get('photo') as File | null;
  const panCardFile = formData.get('panCard') as File | null;

  const MAX_FILE_SIZE = 150 * 1024; // 150KB
  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Photo file size must be under 150KB' }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(photoFile.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, or PDF files are allowed for photos' },
        { status: 400 }
      );
    }
  }

  if (panCardFile && panCardFile.size > 0) {
    if (panCardFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'PAN Card file size must be under 150KB' },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME_TYPES.includes(panCardFile.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, or PDF files are allowed for PAN Card' },
        { status: 400 }
      );
    }
  }

  let photoUrl: string | null = null;
  let panCardFileUrl: string | null = null;

  if (photoFile && photoFile.size > 0) {
    const result = await uploadFile(photoFile, 'photos');
    photoUrl = result?.url ?? null;
  }
  if (panCardFile && panCardFile.size > 0) {
    const result = await uploadFile(panCardFile, 'pan-cards');
    panCardFileUrl = result?.url ?? null;
  }

  // Insert into database with automatic, collision-safe submission ID generation
  let data: any = null;
  let success = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts && !success) {
    attempts++;

    // 1. Retrieve the highest currently assigned submission ID to avoid duplication
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('submission_id')
      .not('submission_id', 'is', null)
      .order('submission_id', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error(
        `[Attempt ${attempts}] Database fetch error during ID generation:`,
        fetchError.message
      );
      return NextResponse.json(
        { error: 'Database connection failure during ID generation' },
        { status: 500 }
      );
    }

    let nextId = 'SVI2200';
    if (existing && existing.length > 0 && existing[0].submission_id) {
      const highestId = existing[0].submission_id;
      const match = highestId.match(/^SVI(\d+)$/);
      if (match) {
        const numericPart = parseInt(match[1], 10);
        const nextNumeric = numericPart + 1;
        const paddingLength = Math.max(4, match[1].length);
        nextId = `SVI${String(nextNumeric).padStart(paddingLength, '0')}`;
      } else {
        console.warn(
          `Highest submission ID has unexpected format: ${highestId}. Sequence continues from next index.`
        );
      }
    }

    // 2. Attach the generated submission_id and insert the user registration record
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
        property_interest: project, // backward compat
        submission_id: nextId,
      })
      .select()
      .single();

    if (insertError) {
      // Check for unique key violation (PostgreSQL code 23505) and retry
      if (insertError.code === '23505') {
        console.warn(
          `[Registration Concurrency] Submission ID collision detected on ID ${nextId}. Retrying... (Attempt ${attempts}/${maxAttempts})`
        );
        continue;
      }

      console.error('Registration insertion error:', insertError.message);
      return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
    }

    data = insertedData;
    success = true;
  }

  if (!success) {
    console.error(`Failed to assign a unique submission ID after ${maxAttempts} attempts.`);
    return NextResponse.json(
      { error: 'Concurrent registration conflict. Please try again.' },
      { status: 500 }
    );
  }

  // Log successfully generated submission ID along with timestamp for auditing
  console.log(
    `[Registration Audit] Generated submission ID: ${data.submission_id} for user: ${data.name} ${data.last_name || ''} at timestamp: ${data.created_at || new Date().toISOString()}`
  );

  // Send email notification (non-blocking)
  const emailStatus = { sent: false, error: null as string | null };
  let primaryRecipient = email;
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Fetch dynamic email settings from database
      let adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      try {
        const { data: emailSetting } = await supabaseAdmin
          .from('portal_settings')
          .select('value')
          .eq('key', 'email_settings')
          .single();

        if (emailSetting?.value && typeof emailSetting.value === 'object') {
          const val = emailSetting.value as any;
          if (val.admin_email) adminEmail = val.admin_email;
        }
      } catch (settingsErr) {
        console.warn('Failed to load email settings from DB, using fallback:', settingsErr);
      }

      // Fetch dynamic advisor profile to retrieve advisor email/real_email
      let advisorEmail: string | null = null;
      if (advisorName) {
        try {
          const { data: advProfile } = await supabaseAdmin
            .from('profiles')
            .select('email, real_email')
            .eq('full_name', advisorName)
            .limit(1);

          if (advProfile && advProfile.length > 0) {
            advisorEmail = advProfile[0].real_email || advProfile[0].email || null;
            console.log(`[Email Audit] Advisor profile found: ${advisorName} -> ${advisorEmail}`);
          } else {
            console.warn(`[Email Audit] No advisor profile found with name: ${advisorName}`);
          }
        } catch (advisorErr) {
          console.error('[Email Audit] Failed to lookup advisor profile:', advisorErr);
        }
      }

      // Multi-recipient distribution list construction
      const bccList: string[] = [];

      // Add admin to distribution list if valid
      if (isValidEmail(adminEmail)) {
        bccList.push(adminEmail);
      } else {
        console.warn(`[Email Audit] Admin email is invalid: ${adminEmail}`);
      }

      // Add advisor to distribution list if valid
      if (advisorEmail && isValidEmail(advisorEmail)) {
        bccList.push(advisorEmail);
      } else if (advisorEmail) {
        console.warn(`[Email Audit] Advisor email is invalid: ${advisorEmail}`);
      }

      // Primary Recipient: Applicant (default) or fallback to Admin if applicant email is invalid/missing
      let isFallbackRoute = false;

      if (!isValidEmail(email)) {
        console.warn(
          `[Email Audit] Applicant email is missing or invalid: ${email}. Routing primary delivery to Admin instead.`
        );
        primaryRecipient = adminEmail;
        isFallbackRoute = true;
      }

      // Generate customized HTML content containing all registration details
      const emailHtmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: right; margin-bottom: 15px;">
            <span style="background-color: #c9a84c; color: #ffffff; font-size: 9px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">
              ✨ System Automated Notification
            </span>
          </div>
          <h2 style="color: #c9a84c; font-family: serif; border-bottom: 2px solid #f0d080; padding-bottom: 10px; margin-bottom: 20px;">
            ${isFallbackRoute ? 'Administrative Record: Property Registration' : 'Registration Acknowledgment'}
          </h2>
          
          <p>Dear <strong>${escapeHtml(firstName)} ${escapeHtml(lastName || '')}</strong>,</p>
          <p>Thank you for registering with SVI Infra Solutions. We are pleased to acknowledge receipt of your property registration inquiry details.</p>
          
          <div style="background-color: #f9f9f9; color: #333333; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c9a84c;">
            <h3 style="margin-top: 0; color: #111; font-size: 14px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px;">Submission Details</h3>
            <table style="border-collapse:collapse;width:100%;font-size:13px;">
              <tr><td style="padding:6px 0;font-weight:bold;width:40%">Submission ID:</td><td style="padding:6px 0">${data.submission_id}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Project Name:</td><td style="padding:6px 0">${escapeHtml(project)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Property Type & Size:</td><td style="padding:6px 0">${escapeHtml(propertyType)} (${escapeHtml(propertySize)})</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Plot Preference:</td><td style="padding:6px 0">${escapeHtml(plotPreference)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Assigned Advisor:</td><td style="padding:6px 0">${escapeHtml(advisorName)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Payment Plan:</td><td style="padding:6px 0">${escapeHtml(paymentPlan)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Payment Mode:</td><td style="padding:6px 0">${escapeHtml(paymentMode)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Scheme Registration Amount:</td><td style="padding:6px 0">INR ${escapeHtml(schemeAmount)}</td></tr>
            </table>
          </div>

          <div style="background-color: #f9f9f9; color: #333333; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #333;">
            <h3 style="margin-top: 0; color: #111; font-size: 14px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px;">Applicant Contact Information</h3>
            <table style="border-collapse:collapse;width:100%;font-size:13px;">
              <tr><td style="padding:6px 0;font-weight:bold;width:40%">Mobile No:</td><td style="padding:6px 0">${escapeHtml(mobileNo)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Email:</td><td style="padding:6px 0">${escapeHtml(email)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Date of Birth:</td><td style="padding:6px 0">${escapeHtml(dob)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Aadhaar Number:</td><td style="padding:6px 0">${escapeHtml(aadharNumber)}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">PAN Number:</td><td style="padding:6px 0">${escapeHtml(panNumber || 'N/A')}</td></tr>
              <tr><td style="padding:6px 0;font-weight:bold">Address:</td><td style="padding:6px 0">${escapeHtml(address)}, ${escapeHtml(city)}, ${escapeHtml(state)}</td></tr>
            </table>
          </div>

          ${
            photoUrl || panCardFileUrl
              ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #111; font-size: 14px;">Submitted Documents</h3>
              <ul style="padding-left: 20px; font-size: 13px;">
                ${photoUrl ? `<li><a href="${photoUrl}" style="color: #c9a84c; text-decoration: none;">View Applicant Photo</a></li>` : ''}
                ${panCardFileUrl ? `<li><a href="${panCardFileUrl}" style="color: #c9a84c; text-decoration: none;">View PAN Card File</a></li>` : ''}
              </ul>
            </div>
          `
              : ''
          }
          
          <p style="font-size: 13px;">Our dedicated property advisor will review your preferences and get in touch with you shortly to assist with the next steps.</p>
          <p style="font-size: 13px;">If you have any questions or require modifications to your submission, feel free to contact us at <a href="mailto:${adminEmail}" style="color: #c9a84c; text-decoration: none;">${adminEmail}</a>.</p>
          
          <br>
          <hr style="border: none; border-top: 1px solid #eaeaea;" />
          <p style="font-size: 11px; color: #888; text-align: center; margin-top: 15px;">
            This is an automated administrative notification copy sent simultaneously to the applicant, assigned advisor, and support administration.<br>
            <strong>SVI Infra Solutions Pvt. Ltd.</strong>
          </p>
        </div>
      `;

      // Single-recipient check: If there's no BCC list and we are falling back, or sending normally
      const emailPayload: any = {
        from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
        to: primaryRecipient,
        subject: `[SYSTEM-AUTO] Property Registration Received: ${firstName} ${lastName || ''} - Submission ${data.submission_id}`,
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

      // Add BCC list if populated
      if (bccList.length > 0) {
        // Filter out primary recipient to avoid duplicates
        const uniqueBcc = bccList.filter(
          (addr) => addr.toLowerCase() !== primaryRecipient.toLowerCase()
        );
        if (uniqueBcc.length > 0) {
          emailPayload.bcc = uniqueBcc;
        }
      }

      // Dispatch using backoff retry handler
      await sendEmailWithRetry(resend, emailPayload);
      emailStatus.sent = true;

      // Dynamic System Notification Alert
      try {
        await NotificationHelper.emailDispatched(
          primaryRecipient,
          emailPayload.subject,
          data.submission_id
        );
      } catch (notifErr) {
        console.error('Failed to log email dispatched system alert:', notifErr);
      }
    }
  } catch (emailErr: any) {
    console.error(
      '[Email Notification Failure] Registration completed but notification delivery failed:',
      emailErr
    );
    emailStatus.error = emailErr.message || String(emailErr);

    // Dynamic System Notification Failure Alert
    try {
      await NotificationHelper.emailDispatchFailed(
        primaryRecipient,
        emailStatus.error || 'Unknown Outage',
        data.submission_id
      );
    } catch (notifErr) {
      console.error('Failed to log email dispatch failure system alert:', notifErr);
    }
  }

  return NextResponse.json({
    success: true,
    id: data.id,
    submissionId: data.submission_id,
    emailStatus,
  });
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

    if (profilesError) {
      console.error('Error fetching advisor profiles:', profilesError.message);
      return NextResponse.json({ error: 'Failed to fetch advisors' }, { status: 500 });
    }

    const advisorNames = (profiles || [])
      .map((p) => p.full_name)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ advisors: advisorNames });
  } catch (err: any) {
    console.error('GET registration error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
