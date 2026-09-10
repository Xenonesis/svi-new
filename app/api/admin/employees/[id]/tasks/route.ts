import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin authorization required');
    }

    const { id: employeeId } = await params;
    if (!employeeId) {
      throw AppError.badRequest('Employee ID is required');
    }

    const { data: tasks, error } = await supabaseAdmin
      .from('employee_tasks')
      .select('*')
      .eq('user_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw AppError.internal(error.message || 'Failed to fetch employee tasks');
    }

    return NextResponse.json({
      success: true,
      employee_id: employeeId,
      tasks: tasks || [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin authorization required');
    }

    const { id: employeeId } = await params;
    if (!employeeId) {
      throw AppError.badRequest('Employee ID is required');
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
      throw AppError.badRequest('Task title is required');
    }

    const description = typeof body?.description === 'string' ? body.description.trim() : null;
    const priority = ['low', 'medium', 'high', 'urgent'].includes(String(body?.priority))
      ? String(body?.priority)
      : 'medium';
    const category = typeof body?.category === 'string' ? body.category : 'general';
    const dueDate = typeof body?.due_date === 'string' ? body.due_date : null;

    const { data: task, error } = await supabaseAdmin
      .from('employee_tasks')
      .insert({
        user_id: employeeId,
        title,
        description,
        priority,
        category,
        due_date: dueDate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw AppError.internal(error.message || 'Failed to assign task');
    }

    return NextResponse.json({
      success: true,
      message: 'Task successfully assigned to employee',
      task,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin authorization required');
    }

    const { id: employeeId } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    if (!body?.id) {
      throw AppError.badRequest('Task ID is required');
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.title === 'string') updates.title = body.title.trim();
    if (typeof body.description === 'string') updates.description = body.description.trim();
    if (typeof body.priority === 'string') updates.priority = body.priority;
    if (typeof body.category === 'string') updates.category = body.category;
    if (typeof body.due_date === 'string') updates.due_date = body.due_date;

    if (typeof body.status === 'string') {
      updates.status = body.status;
      updates.completed_at = body.status === 'completed' ? new Date().toISOString() : null;
    }

    const { data: task, error } = await supabaseAdmin
      .from('employee_tasks')
      .update(updates)
      .eq('id', String(body.id))
      .eq('user_id', employeeId)
      .select()
      .single();

    if (error) {
      throw AppError.internal(error.message || 'Failed to update task');
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin authorization required');
    }

    const { id: employeeId } = await params;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      throw AppError.badRequest('taskId query parameter is required');
    }

    const { error } = await supabaseAdmin
      .from('employee_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', employeeId);

    if (error) {
      throw AppError.internal(error.message || 'Failed to delete task');
    }

    return NextResponse.json({
      success: true,
      message: 'Task removed successfully',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
