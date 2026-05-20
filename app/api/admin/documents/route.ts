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
