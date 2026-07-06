import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { careerRepository, userRepository } from '@/src/lib/repositories';

// GET /api/admin/careers — list all careers (admin view)
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: careers, error } = await careerRepository.listAll();
    if (error) throw AppError.internal('Failed to fetch careers');
    return NextResponse.json({ careers: careers || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/careers — create or update a career listing
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body: {
      id?: string;
      title?: string;
      type?: string;
      salary?: string;
      description?: string;
      icon?: string;
      is_active?: boolean;
      sort_order?: number;
    };
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { id, title, type, salary, description, icon, is_active, sort_order } = body;
    if (!title || !type || !salary) {
      throw AppError.badRequest('Title, type, and salary are required');
    }

    const adminName = await userRepository.getAdminName(admin.id);
    let result;

    if (id) {
      // Update existing
      const { data, error } = await careerRepository.update(id, {
        title,
        type,
        salary,
        description: description ?? null,
        icon: icon ?? 'Briefcase',
        is_active: is_active ?? true,
        sort_order: sort_order ?? 0,
      });
      if (error) throw error;
      result = data;

      try {
        await supabaseAdmin.from('activity_logs').insert({
          user_id: admin.id,
          action_type: 'career_updated',
          description: `${adminName} updated career listing: ${title}.`,
          metadata: { event: 'career_updated', careerId: id, title },
        });
      } catch (logErr) {
        console.error('Failed to log career update:', logErr);
      }
    } else {
      // Create new
      const { data, error } = await careerRepository.create({
        title,
        type,
        salary,
        description: description ?? null,
        icon: icon ?? 'Briefcase',
        is_active: is_active ?? true,
        sort_order: sort_order ?? 0,
      });
      if (error) throw error;
      result = data;

      try {
        await supabaseAdmin.from('activity_logs').insert({
          user_id: admin.id,
          action_type: 'career_created',
          description: `${adminName} created career listing: ${title}.`,
          metadata: { event: 'career_created', careerId: result?.id, title },
        });
      } catch (logErr) {
        console.error('Failed to log career creation:', logErr);
      }
    }

    return NextResponse.json({ success: true, career: result });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/careers?id=<uuid>
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw AppError.badRequest('Career ID is required');

    const adminName = await userRepository.getAdminName(admin.id);
    const { data: career } = await careerRepository.getById(id);
    const careerTitle = career?.title || 'Unknown Career';

    const { error } = await careerRepository.delete(id);
    if (error) throw error;

    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'career_deleted',
        description: `${adminName} deleted career listing: ${careerTitle}.`,
        metadata: { event: 'career_deleted', careerId: id, title: careerTitle },
      });
    } catch (logErr) {
      console.error('Failed to log career deletion:', logErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
