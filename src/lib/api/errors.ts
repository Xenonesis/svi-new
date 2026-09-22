import { NextResponse } from 'next/server';
import { sanitizeDatabaseErrorMessage } from './parseError';

/**
 * Base application error with HTTP status code and error code.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static validationError(details: unknown) {
    return new AppError(400, 'VALIDATION_ERROR', 'Invalid input', details);
  }

  static conflict(message = 'Conflict', details?: unknown) {
    return new AppError(409, 'CONFLICT', message, details);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}

/**
 * Unified error handler for API routes.
 * Catches AppError and returns standardized JSON responses.
 * Also intercepts raw database/PostgREST exceptions and transforms them
 * into proper HTTP status codes and user-friendly error messages.
 */
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // Intercept database/PostgREST error codes
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const code = typeof errObj.code === 'string' ? errObj.code : '';
    const rawMsg = typeof errObj.message === 'string' ? errObj.message : '';

    // 42501: Insufficient privilege / RLS violation
    if (
      code === '42501' ||
      rawMsg.toLowerCase().includes('permission denied') ||
      rawMsg.toLowerCase().includes('row-level security')
    ) {
      const friendlyMsg = sanitizeDatabaseErrorMessage(rawMsg);
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: friendlyMsg } },
        { status: 403 }
      );
    }

    // 23505: Unique constraint violation
    if (code === '23505' || rawMsg.toLowerCase().includes('unique constraint')) {
      const friendlyMsg = sanitizeDatabaseErrorMessage(rawMsg);
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: friendlyMsg } },
        { status: 409 }
      );
    }

    // PGRST116: Resource not found / single row requested
    if (code === 'PGRST116' || rawMsg.toLowerCase().includes('multiple (or no) rows returned')) {
      const friendlyMsg = sanitizeDatabaseErrorMessage(rawMsg);
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: friendlyMsg } },
        { status: 404 }
      );
    }

    // 23503: Foreign key dependency constraint
    if (code === '23503' || rawMsg.toLowerCase().includes('foreign key constraint')) {
      const friendlyMsg = sanitizeDatabaseErrorMessage(rawMsg);
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: friendlyMsg } },
        { status: 400 }
      );
    }
  }

  // Log unexpected errors for debugging
  console.error('[API] Unhandled error:', error instanceof Error ? error.message : error);

  return NextResponse.json(
    {
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' },
    },
    { status: 500 }
  );
}

export {
  extractApiErrorMessage,
  getApiErrorMessage,
  sanitizeDatabaseErrorMessage,
} from './parseError';
