import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z, type ZodTypeAny } from 'zod';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { ok, bad } from './responder';
import { verifyAdminOrThrow } from './auth';
import type { AdminActor, RequestContext } from './auth';

export interface JsonBody<T> {
  raw: T;
}

export type JsonHandler<TIn, TOut> = (ctx: RequestContext, body: TIn) => Promise<TOut> | TOut;

export type EmptyHandler<TOut> = (ctx: RequestContext) => Promise<TOut> | TOut;

export { ok, bad, noContent } from './responder';

/** Parse and validate the JSON request body. Throws AppError.badRequest on failure. */
export async function parseJson<T extends ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw AppError.badRequest('Request body must be valid JSON');
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw AppError.validationError(result.error.flatten());
  }
  return result.data as z.infer<T>;
}

/**
 * Wrap a JSON-mutating handler so the route file only has to wire this up.
 *   export const POST = withAdminJson(sendEmailSchema, sendEmail);
 */
export function withAdminJson<TIn extends ZodTypeAny, TOut>(
  schema: TIn,
  handler: JsonHandler<z.infer<TIn>, TOut>
) {
  return async (request: NextRequest) => {
    try {
      const ctx = await verifyAdminOrThrow(request);
      const body = await parseJson(request, schema);
      const result = await handler(ctx, body);
      return NextResponse.json(result);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/** Wrap a GET-style handler that does not need a body. */
export function withAdmin<TOut>(handler: EmptyHandler<TOut>) {
  return async (request: NextRequest) => {
    try {
      const ctx = await verifyAdminOrThrow(request);
      const result = await handler(ctx);
      return NextResponse.json(result);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/** Route handler that dispatches to a sub-handler based on a string action. */
export function createActionDispatcher<
  TInput,
  THandlers extends Record<string, (ctx: RequestContext, body: TInput) => unknown>,
>(handlers: THandlers) {
  return async function dispatchAction(request: NextRequest) {
    try {
      const ctx = await verifyAdminOrThrow(request);
      const body = (await request.json()) as TInput & { action?: keyof THandlers };
      const action = body?.action as keyof THandlers | undefined;
      if (!action || !(action in handlers)) {
        return bad('Unknown action', 400, 'UNKNOWN_ACTION');
      }
      const handler = handlers[action as keyof THandlers];
      const result = await handler(ctx, body as TInput);
      return NextResponse.json(result);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/** Dispatcher for GET endpoints that route by `?action=`. */
export function createQueryDispatcher<
  THandlers extends Record<string, (ctx: RequestContext) => unknown>,
>(handlers: THandlers) {
  return async function dispatchQuery(request: NextRequest) {
    try {
      const ctx = await verifyAdminOrThrow(request);
      const url = new URL(request.url);
      const action = url.searchParams.get('action') as keyof THandlers | null;
      if (!action || !(action in handlers)) {
        return bad('Unknown action', 400, 'UNKNOWN_ACTION');
      }
      const handler = handlers[action as keyof THandlers];
      const result = await handler(ctx);
      return NextResponse.json(result);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

export type { AdminActor, RequestContext };
