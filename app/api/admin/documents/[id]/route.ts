import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

// PATCH /api/admin/documents/[id] — update document status / urls
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { status, pdf_url, image_url } = body;

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (pdf_url) updateData.pdf_url = pdf_url;
  if (image_url) updateData.image_url = image_url;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log download activity when status set to completed
  if (status === 'completed') {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'document_downloaded',
      description: `${data.document_type.replace(/_/g, ' ')} downloaded`,
      target_id: data.id,
      target_type: 'document',
    });
  }

  return NextResponse.json({ document: data });
}

// DELETE /api/admin/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabaseAdmin.from('documents').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
