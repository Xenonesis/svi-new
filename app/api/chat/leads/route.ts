import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { normalizeE164 } from '@/src/lib/whatsapp/phone';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 lead submissions per IP per minute
    const limited = await rateLimit(req, { limit: 3, windowSeconds: 60 });
    if (limited) return limited;

    let body;
    try {
      body = await req.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { name, phone, email, source = 'chatbot' } = body;

    if (!name?.trim() || (!phone?.trim() && !email?.trim())) {
      throw AppError.badRequest('Name and either phone or email are required');
    }

    const cleanPhone = phone?.trim() ? normalizeE164(phone) : null;
    if (phone?.trim() && !cleanPhone) {
      throw AppError.badRequest('Invalid phone number');
    }

    const lead = {
      name: name.trim(),
      phone: cleanPhone,
      normalized_phone: cleanPhone,
      email: email?.trim() || null,
      source: source.trim(),
    };
    const query = cleanPhone
      ? supabaseAdmin.from('chat_leads').upsert(lead, { onConflict: 'normalized_phone' })
      : supabaseAdmin.from('chat_leads').insert(lead);
    const { data, error } = await query.select().single();

    if (error) {
      console.error('Chat lead save error:', error.message);
      throw AppError.internal('Failed to save lead');
    }

    // Notify all admins about the new lead
    NotificationHelper.chatLeadCreated(name.trim(), cleanPhone ?? email.trim()).catch((err) =>
      console.error('Failed to send chat lead notification:', err)
    );

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
