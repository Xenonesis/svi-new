/**
 * Barrel for GET query handlers.
 * Each handler preserves the original response shape.
 */
import { getDomains, getInboundStatus, getUsage } from './queries/diagnostics';
import {
  getInbox,
  getInboxDetail,
  getScheduledEmails,
  getSentEmailDetail,
  getSentEmails,
} from './queries/inbox';
import type { RequestContext } from '@/src/server/http/auth';
import { AppError } from '@/src/lib/api/errors';

type Ctx = RequestContext;

export const queryHandlers = {
  domains: (ctx: Ctx) => getDomains(),
  inbound_status: (ctx: Ctx) => getInboundStatus(ctx.request),
  usage: (ctx: Ctx) => getUsage(),
  inbox: (ctx: Ctx) => getInbox(ctx),
  replies: (ctx: Ctx) => getInbox(ctx),
  scheduled: (ctx: Ctx) => getScheduledEmails(ctx),
} as const;

export async function queryByName(
  ctx: Ctx,
  name: keyof typeof queryHandlers | string,
  params: Record<string, string>
) {
  switch (name) {
    case 'inbox_detail': {
      const id = params.id;
      if (!id) throw AppError.badRequest('Missing email id');
      return getInboxDetail(ctx, id);
    }
    case 'email': {
      const id = params.id;
      if (!id) throw AppError.badRequest('Missing email id');
      return getSentEmailDetail(ctx, id);
    }
    case 'sent': {
      const limit = params.limit ? parseInt(params.limit, 10) : 50;
      const after = params.after;
      return getSentEmails(ctx, { limit, after });
    }
    default:
      if (name && name in queryHandlers) {
        return (queryHandlers as any)[name](ctx);
      }
      // Fallback: empty sent list keeps previous default-route behavior; never null.
      return getSentEmails(ctx, { limit: 50 });
  }
}
