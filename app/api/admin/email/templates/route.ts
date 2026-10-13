import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { sanitizeEmailHtml, extractTemplateVars } from '@/src/lib/utils/templateParser';
import type { CustomEmailTemplate } from '@/src/components/admin/email/types';

export const maxDuration = 30;

const SETTINGS_KEY = 'custom_email_templates';

/**
 * GET /api/admin/email/templates
 * Returns all custom email templates saved by admins.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      throw AppError.internal(error.message);
    }

    const templates: CustomEmailTemplate[] = Array.isArray(data?.value) ? data.value : [];
    return NextResponse.json({ success: true, templates });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/admin/email/templates
 * Creates or updates a custom email template.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, subject, category, description, html, icon } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ error: 'Template subject is required' }, { status: 400 });
    }
    if (!html || typeof html !== 'string' || !html.trim()) {
      return NextResponse.json({ error: 'Template HTML content is required' }, { status: 400 });
    }

    const sanitizedHtml = sanitizeEmailHtml(html);
    const variables = extractTemplateVars(sanitizedHtml);
    const nowIso = new Date().toISOString();

    // 1. Fetch current templates
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (fetchError) {
      throw AppError.internal(fetchError.message);
    }

    const currentTemplates: CustomEmailTemplate[] = Array.isArray(existingData?.value)
      ? existingData.value
      : [];

    let targetTemplate: CustomEmailTemplate;
    let updatedList: CustomEmailTemplate[];

    const existingIndex = id ? currentTemplates.findIndex((t) => t.id === id) : -1;

    if (existingIndex >= 0) {
      // Update existing template
      targetTemplate = {
        ...currentTemplates[existingIndex],
        name: name.trim(),
        subject: subject.trim(),
        category: (category || currentTemplates[existingIndex].category || 'Custom').trim(),
        description:
          description !== undefined
            ? description.trim()
            : currentTemplates[existingIndex].description,
        html: sanitizedHtml,
        variables,
        icon: icon || currentTemplates[existingIndex].icon || 'Sparkles',
        isCustom: true,
        updatedAt: nowIso,
      };
      updatedList = [...currentTemplates];
      updatedList[existingIndex] = targetTemplate;
    } else {
      // Create new template
      targetTemplate = {
        id: id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        subject: subject.trim(),
        category: (category || 'Custom').trim(),
        description: description?.trim() || '',
        html: sanitizedHtml,
        variables,
        icon: icon || 'Sparkles',
        isCustom: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updatedList = [targetTemplate, ...currentTemplates];
    }

    // 2. Persist to portal_settings
    const { error: upsertError } = await supabaseAdmin.from('portal_settings').upsert({
      key: SETTINGS_KEY,
      value: updatedList,
      updated_at: nowIso,
    });

    if (upsertError) {
      throw AppError.internal(upsertError.message);
    }

    // 3. Log activity non-blocking
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: existingIndex >= 0 ? 'email_template_updated' : 'email_template_created',
        description: `${existingIndex >= 0 ? 'Updated' : 'Created'} custom email template "${targetTemplate.name}"`,
      });
    } catch {
      // Non-fatal logging
    }

    return NextResponse.json({
      success: true,
      template: targetTemplate,
      templates: updatedList,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/admin/email/templates
 * Deletes a custom email template by ID.
 */
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body might be empty
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (fetchError) {
      throw AppError.internal(fetchError.message);
    }

    const currentTemplates: CustomEmailTemplate[] = Array.isArray(existingData?.value)
      ? existingData.value
      : [];

    const deletedTemplate = currentTemplates.find((t) => t.id === id);
    const updatedList = currentTemplates.filter((t) => t.id !== id);

    const { error: upsertError } = await supabaseAdmin.from('portal_settings').upsert({
      key: SETTINGS_KEY,
      value: updatedList,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      throw AppError.internal(upsertError.message);
    }

    // Non-blocking activity log
    try {
      if (deletedTemplate) {
        await supabaseAdmin.from('activity_logs').insert({
          user_id: admin.id,
          action_type: 'email_template_deleted',
          description: `Deleted custom email template "${deletedTemplate.name}"`,
        });
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true, templates: updatedList });
  } catch (err) {
    return handleApiError(err);
  }
}
