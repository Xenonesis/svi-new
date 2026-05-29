import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

// GET /api/admin/documents — list documents with optional filters
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const userId = searchParams.get('userId');
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '50') || 50);

  let query = supabaseAdmin
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type) query = query.eq('document_type', type);
  if (userId) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents: data });
}

// POST /api/admin/documents — create a new document record
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { document_type, user_id, form_data, pdf_url, image_url, status, metadata } = body;

  const validTypes = ['allotment_letter', 'payment_receipt', 'payment_plan', 'offer_letter', 'bba'];
  if (!document_type || !user_id) {
    return NextResponse.json({ error: 'document_type and user_id are required' }, { status: 400 });
  }
  if (!validTypes.includes(document_type)) {
    return NextResponse.json(
      { error: `Invalid document_type. Must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert({
      document_type,
      user_id,
      created_by: admin.id,
      form_data,
      pdf_url,
      image_url,
      status: status || 'draft',
      metadata,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3. Send automated email notification to user's real email address if enabled
  try {
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, real_email')
      .eq('id', user_id)
      .single();

    if (userProfile && userProfile.real_email) {
      let isSharingEnabled = true;
      const { data: sharingSetting } = await supabaseAdmin
        .from('portal_settings')
        .select('value')
        .eq('key', 'global_email_sharing')
        .single();
      if (sharingSetting?.value) {
        isSharingEnabled = sharingSetting.value.enabled !== false;
      }

      if (isSharingEnabled) {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const { Resend } = await import('resend');
          const resend = new Resend(resendApiKey);
          const docTypeFormatted = (document_type ?? 'document').replace(/_/g, ' ');
          await resend.emails.send({
            from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
            to: userProfile.real_email,
            subject: `New Document Available: ${docTypeFormatted.toUpperCase()}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #c9a84c; font-family: serif; text-transform: capitalize;">New ${docTypeFormatted} Generated</h2>
                <p>Hello <strong>${userProfile.full_name}</strong>,</p>
                <p>An administrative action was completed on your account. A new document has been uploaded for you:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Document Type:</strong> <span style="text-transform: capitalize;">${docTypeFormatted}</span></p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ${status || 'Completed'}</p>
                  ${pdf_url ? `<p style="margin: 5px 0;"><strong>File URL:</strong> <a href="${pdf_url}" style="color: #c9a84c; text-decoration: none;">Download Document</a></p>` : ''}
                </div>
                <p>Please log in to your SVI Client Portal to view or download this document.</p>
                <br>
                <hr style="border: none; border-top: 1px solid #eaeaea;" />
                <p style="font-size: 11px; color: #888;">This is an automated administrative notification. Please contact SVI Support for help.</p>
              </div>
            `,
          });
        }
      }
    }
  } catch (emailErr) {
    console.error('Failed to dispatch document generated welcome email:', emailErr);
  }

  // Log activity
  await supabaseAdmin.from('activity_logs').insert({
    user_id: admin.id,
    action_type: 'document_generated',
    description: `${(document_type ?? 'document').replace(/_/g, ' ')} generated`,
    target_id: data.id,
    target_type: 'document',
    metadata: { user_id },
  });

  return NextResponse.json({ document: data }, { status: 201 });
}
