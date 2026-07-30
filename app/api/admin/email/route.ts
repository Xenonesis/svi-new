import { NextResponse } from 'next/server';
import { withAdmin, createActionDispatcher } from '@/src/server/http/handler';
import { handleApiError } from '@/src/lib/api/errors';
import { postHandlers } from '@/src/server/email/handlers';
import { queryHandlers, queryByName } from '@/src/server/email/queryHandlers';

/**
 * Admin email hub. After refactor this file is a thin dispatcher:
 * every action lives in `src/server/email/**` and is imported here.
 * Endpoint, status codes, and response JSON are preserved.
 */

export const GET = withAdmin(async (ctx) => {
  try {
    const url = new URL(ctx.request.url);
    const action = url.searchParams.get('action');
    const emailId = url.searchParams.get('id');
    const limit = url.searchParams.get('limit') || undefined;
    const after = url.searchParams.get('after') || undefined;

    const params: Record<string, string> = {};
    if (emailId) params.id = emailId;
    if (limit) params.limit = limit;
    if (after) params.after = after;

    // Parameterized endpoints first.
    if (action === 'sent' || (!action && (limit || after))) {
      const result = await queryByName(ctx, 'sent', params);
      return NextResponse.json(result);
    }
    if (action === 'inbox_detail') {
      const result = await queryByName(ctx, 'inbox_detail', params);
      return NextResponse.json(result);
    }
    if (action === 'email') {
      const result = await queryByName(ctx, 'email', params);
      return NextResponse.json(result);
    }

    // Map-style actions.
    if (action && action in queryHandlers) {
      const result = await queryByName(ctx, action, params);
      return NextResponse.json(result);
    }

    // Fallback: no action → sent list (preserving legacy GET behavior).
    const result = await queryByName(ctx, 'sent', {
      limit: limit ?? '50',
      ...(after ? { after } : {}),
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
});

// The dispatcher accepts the loose shape of `postHandlers` whose per-action
// input types differ; we type the wiring here as a permissive record so the
// dispatcher can safely call into each handler with its original payload.
export const POST = createActionDispatcher(
  postHandlers as unknown as Record<
    string,
    (ctx: Parameters<(typeof postHandlers)[keyof typeof postHandlers]>[0], body: any) => unknown
  >
);
