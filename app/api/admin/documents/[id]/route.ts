import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/documents/[id] — get a specific document
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    const { data, error } = await supabaseAdmin.from('documents').select('*').eq('id', id).single();

    if (error) throw AppError.internal(error.message);
    if (!data) throw AppError.notFound('Document not found');

    return NextResponse.json({ document: data });
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/admin/documents/[id] — update document status / urls
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }
    const { status, pdf_url, image_url, form_data } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (pdf_url !== undefined) updateData.pdf_url = pdf_url;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (form_data !== undefined) {
      if (form_data && form_data.quotationNo) {
        const rawQuotationNo = String(form_data.quotationNo).trim();
        const { data: existingDoc } = await supabaseAdmin
          .from('documents')
          .select('id')
          .eq('document_type', 'quotation')
          .neq('id', id)
          .filter('form_data->>quotationNo', 'eq', rawQuotationNo)
          .maybeSingle();

        if (existingDoc) {
          throw AppError.conflict(
            `Quotation number "${rawQuotationNo}" already exists in the database. Please generate a new unique quotation number.`
          );
        }
      }
      updateData.form_data = form_data;
    }
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw AppError.internal(error.message);
    if (!data) throw AppError.notFound('Document not found or already deleted');

    if (status === 'completed') {
      try {
        await supabaseAdmin.from('activity_logs').insert({
          user_id: admin.id,
          action_type: 'document_downloaded',
          description: `${(data.document_type ?? 'document').replace(/_/g, ' ')} downloaded`,
          target_id: data.id,
          target_type: 'document',
        });
      } catch {
        // Activity log failure is non-blocking
      }
    }

    try {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', data.user_id)
        .single();
      await NotificationHelper.documentUpdated(
        data.document_type,
        profileData?.full_name || 'User',
        data.id
      );
    } catch (notifErr) {
      console.error('Failed to create document update notification:', notifErr);
    }

    return NextResponse.json({ document: data });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    // Perform delete and retrieve document_type in a single atomic database query
    const { data: deletedDocs, error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)
      .select('document_type');

    if (error) throw AppError.internal(error.message);

    const deletedDocType = deletedDocs?.[0]?.document_type || 'document';

    // Non-blocking background notification dispatch to guarantee instant API response
    (async () => {
      try {
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', admin.id)
          .single();
        await NotificationHelper.documentDeleted(deletedDocType, profileData?.full_name || 'Admin');
      } catch (notifErr) {
        console.error('Failed to create document delete notification:', notifErr);
      }
    })().catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
