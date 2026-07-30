import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError } from '@/src/lib/api/errors';

export interface AdminActor {
  id: string;
  email: string | null;
  /** Resolved display name from `profiles.full_name` with email/Admin fallback. */
  displayName: string;
}

export interface RequestContext {
  request: NextRequest;
  actor: AdminActor;
}

export class UnauthorizedError extends Error {
  readonly code = 'UNAUTHORIZED';
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

function resolveActorSync(admin: User): AdminActor {
  return {
    id: admin.id,
    email: admin.email ?? null,
    displayName: admin.email ?? 'Admin',
  };
}

/**
 * Build a typed RequestContext after verifying that the caller is an admin.
 * Keeps verification as a single concern at the edge of every admin route.
 */
export async function requireAdmin(request: NextRequest): Promise<RequestContext> {
  const admin = await verifyAdmin(request);
  if (!admin) throw new UnauthorizedError();

  const actor = resolveActorSync(admin);
  return { request, actor };
}

/**
 * Verify admin + return the canonical 401 response if not.
 * Use in handler bodies when you want to throw the AppError used by the existing error pipeline.
 */
export async function verifyAdminOrThrow(request: NextRequest): Promise<RequestContext> {
  try {
    return await requireAdmin(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) throw AppError.unauthorized(err.message);
    throw err;
  }
}
