import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';

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
    if (form_data !== undefined) updateData.form_data = form_data;

    const { data, error } = await supabaseAdmin
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw AppError.internal(error.message);

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
    let deletedDocType = 'document';
    try {
      const { data: doc } = await supabaseAdmin
        .from('documents')
        .select('document_type')
        .eq('id', id)
        .single();
      deletedDocType = doc?.document_type || 'document';
    } catch {
      // Document fetch failure is non-blocking
    }

    const { error } = await supabaseAdmin.from('documents').delete().eq('id', id);
    if (error) throw AppError.internal(error.message);

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

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
