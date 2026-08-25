import { NextResponse } from 'next/server';

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

  static internal(message = 'Internal server error') {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}

/**
 * Unified error handler for API routes.
 * Catches AppError and returns standardized JSON responses.
 * Unknown errors are logged and return a generic 500.
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

  // Log unexpected errors for debugging
  console.error('[API] Unhandled error:', error instanceof Error ? error.message : error);

  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  );
}

export { extractApiErrorMessage, getApiErrorMessage } from './parseError';
