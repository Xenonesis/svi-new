import { NextResponse } from 'next/server';

// GET /api/cron/cleanup-registrations
// DISABLED by admin policy: registrations must never auto-delete.
// Admin deletes manually from /admin/registrations (Delete button).
export async function GET() {
  return NextResponse.json(
    { success: false, deleted: 0, message: 'Auto-cleanup disabled by admin policy' },
    { status: 410 }
  );
}
