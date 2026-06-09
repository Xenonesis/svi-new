import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/campaigns/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw AppError.notFound('Campaign not found');
    return NextResponse.json({ campaign: data });
  } catch (err) {
    return handleApiError(err);
  }
}

// PUT /api/admin/campaigns/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    let body: any;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON');
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('email_campaigns')
      .select('status, title')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) throw AppError.notFound('Campaign not found');
    if (existing.status === 'sent' || existing.status === 'cancelled') {
      throw AppError.badRequest(`Cannot edit a ${existing.status} campaign`);
    }

    const {
      title,
      subject,
      body_html,
      recipient_group,
      custom_emails,
      scheduled_at,
      reminder_at,
      reminder_subject,
    } = body;

    const newStatus = scheduled_at ? 'scheduled' : 'draft';

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('email_campaigns')
      .update({
        ...(title !== undefined && { title }),
        ...(subject !== undefined && { subject }),
        ...(body_html !== undefined && { body_html }),
        ...(recipient_group !== undefined && { recipient_group }),
        custom_emails: recipient_group === 'custom' ? (custom_emails ?? null) : null,
        scheduled_at: scheduled_at || null,
        reminder_at: reminder_at || null,
        reminder_subject: reminder_subject || null,
        status: newStatus,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw AppError.internal(updateErr.message);

    // Activity log + notification (non-blocking)
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'campaign_updated',
        description: `Campaign "${existing.title}" updated (${newStatus}).`,
        metadata: { campaignId: id },
      });
    } catch (_err) {
      // Activity log failure is non-blocking
    }

    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', admin.id)
        .single();
      const adminName = profile?.full_name || admin.email || 'Admin';
      await NotificationHelper.campaignUpdated(existing.title, adminName);
    } catch (notifErr) {
      console.error('Failed to create campaign update notification:', notifErr);
    }

    return NextResponse.json({ campaign: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/campaigns/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    const { data: existing } = await supabaseAdmin
      .from('email_campaigns')
      .select('title, status')
      .eq('id', id)
      .single();

    if (existing?.status === 'scheduled') {
      await supabaseAdmin.from('email_campaigns').update({ status: 'cancelled' }).eq('id', id);
    } else {
      const { error } = await supabaseAdmin.from('email_campaigns').delete().eq('id', id);
      if (error) throw AppError.internal(error.message);
    }

    // Activity log + notification (non-blocking)
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'campaign_deleted',
        description: `Campaign "${existing?.title || id}" deleted/cancelled.`,
        metadata: { campaignId: id },
      });
    } catch {
      // Activity log failure is non-blocking
    }

    try {
      await NotificationHelper.campaignDeleted(
        existing?.title || 'Unknown Campaign',
        admin.email || 'Admin'
      );
    } catch (notifErr) {
      console.error('Failed to create campaign delete notification:', notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
