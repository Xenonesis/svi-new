import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

const VALID_DOC_TYPES = [
  'allotment_letter',
  'payment_receipt',
  'payment_plan',
  'offer_letter',
  'bba',
];

// GET /api/admin/documents — list documents with optional filters
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

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
    if (error) throw AppError.internal(error.message);

    return NextResponse.json({ documents: data });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/documents — create a new document record
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { document_type, user_id, form_data, pdf_url, image_url, status, metadata } = body;
    const resolvedUserId = user_id || admin.id;

    if (!document_type || !resolvedUserId) {
      throw AppError.badRequest('document_type and user_id are required');
    }
    if (!VALID_DOC_TYPES.includes(document_type)) {
      throw AppError.badRequest(
        `Invalid document_type. Must be one of: ${VALID_DOC_TYPES.join(', ')}`
      );
    }

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        document_type,
        user_id: resolvedUserId,
        created_by: admin.id,
        form_data,
        pdf_url,
        image_url,
        status: status || 'draft',
        metadata,
      })
      .select()
      .single();

    if (error) throw AppError.internal(error.message);

    // Send email notification (non-blocking)
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, real_email')
        .eq('id', user_id)
        .single();

      if (userProfile?.real_email) {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const { Resend } = await import('resend');
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
            to: userProfile.real_email,
            subject: `Your ${document_type.replace(/_/g, ' ')} is Ready`,
            html: `<p>Dear ${userProfile.full_name},<br>Your ${document_type.replace(/_/g, ' ')} has been generated.</p>`,
          });
        }
      }
    } catch (emailErr) {
      console.error('Document email notification failed:', emailErr);
    }

    return NextResponse.json({ document: data }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
