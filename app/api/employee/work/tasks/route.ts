import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view tasks');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    let query = supabaseAdmin.from('employee_tasks').select('*').eq('user_id', verified.user.id);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data: tasks, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw AppError.internal('Failed to fetch tasks');
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to create tasks');
    }

    const body = await request.json().catch(() => null);
    if (!body?.title) {
      throw AppError.badRequest('Task title is required');
    }

    const { title, description, priority = 'medium', category = 'general', due_date } = body;

    const { data: task, error } = await supabaseAdmin
      .from('employee_tasks')
      .insert({
        user_id: verified.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        category,
        due_date: due_date || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw AppError.internal('Failed to create task');
    }

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to update tasks');
    }

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Task ID is required');
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined)
      updates.description = body.description ? body.description.trim() : null;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.category !== undefined) updates.category = body.category;
    if (body.due_date !== undefined) updates.due_date = body.due_date;

    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from('employee_tasks')
      .update(updates)
      .eq('id', body.id)
      .eq('user_id', verified.user.id)
      .select()
      .single();

    if (error || !updated) {
      throw AppError.badRequest('Task not found or update failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      task: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to delete tasks');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw AppError.badRequest('Task ID is required');
    }

    const { error } = await supabaseAdmin
      .from('employee_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', verified.user.id);

    if (error) {
      console.error('Error deleting task:', error);
      throw AppError.internal('Failed to delete task');
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
