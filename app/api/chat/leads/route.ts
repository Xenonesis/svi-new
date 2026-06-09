import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { rateLimit } from '@/src/lib/api/rateLimit';

export async function POST(req: NextRequest) {
  // Rate limit: 3 lead submissions per IP per minute
  const limited = rateLimit(req, { limit: 3, windowSeconds: 60 });
  if (limited) return limited;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, phone } = body;

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }

  const cleanPhone = phone.replace(/\s/g, '');
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('chat_leads')
    .insert({
      name: name.trim(),
      phone: cleanPhone,
      source: 'chatbot',
    })
    .select()
    .single();

  if (error) {
    console.error('Chat lead save error:', error.message);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
