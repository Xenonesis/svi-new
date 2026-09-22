/**
 * Universal error message extractor and sanitizer.
 * Safely parses any error format (ApiError, standard Error, JSON error objects,
 * Zod validation arrays, Supabase errors, or string messages) into a human-readable string.
 * Automatically translates raw PostgreSQL, PostgREST, and security errors into polite,
 * actionable, user-friendly language. Prevents `[object Object]` from ever appearing in the UI.
 */

/**
 * Transforms raw database, network, and security exceptions into polite,
 * actionable, user-friendly language.
 */
export function sanitizeDatabaseErrorMessage(rawMessage: string): string {
  if (!rawMessage || typeof rawMessage !== 'string') return rawMessage;

  const lower = rawMessage.toLowerCase();

  // 1. Permission Denied / Row Level Security
  if (
    lower.includes('permission denied') ||
    lower.includes('insufficient_privilege') ||
    lower.includes('row-level security') ||
    lower.includes('violates row security') ||
    lower.includes('42501')
  ) {
    return 'Access restricted: You do not have permission to perform this action. Please check your administrative privileges.';
  }

  // 2. JWT Expired / Unauthorized session
  if (
    lower.includes('jwt expired') ||
    lower.includes('token is expired') ||
    lower.includes('pgrst301') ||
    lower.includes('invalid claim') ||
    lower.includes('token expired')
  ) {
    return 'Your session has expired. Please sign in again to continue.';
  }

  // 3. PostgREST PGRST116 (No rows found or single row violation) / 406 Not Acceptable
  if (
    lower.includes('pgrst116') ||
    lower.includes('multiple (or no) rows returned') ||
    lower.includes('406') ||
    lower.includes('not acceptable')
  ) {
    return 'The requested record was not found or has been modified. Please refresh and try again.';
  }

  // 4. Duplicate unique constraint (23505)
  if (
    lower.includes('duplicate key value') ||
    lower.includes('23505') ||
    lower.includes('violates unique constraint')
  ) {
    return 'A record with these details already exists. Please verify your input and avoid duplicate entries.';
  }

  // 5. Foreign key dependency constraint (23503)
  if (
    lower.includes('violates foreign key constraint') ||
    lower.includes('23503') ||
    lower.includes('foreign key constraint')
  ) {
    return 'This operation cannot be completed because other records in the system depend on this item.';
  }

  // 6. Network & Connection dropouts
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('econnrefused') ||
    lower.includes('network request failed')
  ) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // 7. Request Timeout
  if (lower.includes('abort') || lower.includes('timed out') || lower.includes('timeout')) {
    return 'The request took too long to complete. Please check your connection and try again.';
  }

  // 8. Rate Limiting
  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('429')
  ) {
    return 'Too many requests. Please wait a few seconds before trying again.';
  }

  return rawMessage;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  if (!error) return fallback;

  let raw = '';

  // 1. If error is already a string
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed && trimmed !== '[object Object]') {
      raw = trimmed;
    } else {
      return fallback;
    }
  }

  // 2. If error is an Error instance
  else if (error instanceof Error) {
    const msg = error.message;
    if (msg && msg !== '[object Object]') {
      raw = msg;
    } else {
      return fallback;
    }
  }

  // 3. If error is an object (e.g. parsed JSON from API response or Supabase error object)
  else if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;

    // Case: { error: { message: "...", details: ... } } or { error: "..." }
    if (errObj.error !== undefined && errObj.error !== null) {
      if (typeof errObj.error === 'string') {
        const trimmed = errObj.error.trim();
        if (trimmed && trimmed !== '[object Object]') raw = trimmed;
      } else if (typeof errObj.error === 'object' && errObj.error !== null) {
        const nested = errObj.error as Record<string, unknown>;
        if (typeof nested.message === 'string' && nested.message !== '[object Object]') {
          if (Array.isArray(nested.details) && nested.details.length > 0) {
            const detailStrs = nested.details
              .map((d: unknown) => {
                if (typeof d === 'string') return d;
                if (d && typeof d === 'object') {
                  const item = d as Record<string, unknown>;
                  const path = item.path;
                  const field = path
                    ? `Field "${Array.isArray(path) ? path.join('.') : String(path)}": `
                    : '';
                  return `${field}${typeof item.message === 'string' ? item.message : JSON.stringify(d)}`;
                }
                return String(d);
              })
              .filter(Boolean);
            if (detailStrs.length > 0) {
              raw = `${nested.message} (${detailStrs.join(', ')})`;
            } else {
              raw = nested.message;
            }
          } else {
            raw = nested.message;
          }
        } else if (typeof nested.details === 'string') {
          raw = nested.details;
        }
      }
    }

    // Case: { message: "..." }
    if (!raw && typeof errObj.message === 'string' && errObj.message !== '[object Object]') {
      raw = errObj.message;
    }

    // Case: { msg: "..." }
    if (!raw && typeof errObj.msg === 'string' && errObj.msg !== '[object Object]') {
      raw = errObj.msg;
    }

    // Case: { errors: [...] } (e.g. express-validator / Zod)
    if (!raw && Array.isArray(errObj.errors) && errObj.errors.length > 0) {
      const msgs = errObj.errors
        .map((e: unknown) => {
          if (typeof e === 'string') return e;
          if (e && typeof e === 'object') {
            const errItem = e as Record<string, unknown>;
            return typeof errItem.message === 'string' ? errItem.message : JSON.stringify(e);
          }
          return String(e);
        })
        .filter(Boolean);
      if (msgs.length > 0) raw = msgs.join(', ');
    }

    // Case: { details: [...] }
    if (!raw && Array.isArray(errObj.details) && errObj.details.length > 0) {
      const msgs = errObj.details
        .map((e: unknown) => {
          if (typeof e === 'string') return e;
          if (e && typeof e === 'object') {
            const errItem = e as Record<string, unknown>;
            return typeof errItem.message === 'string' ? errItem.message : JSON.stringify(e);
          }
          return String(e);
        })
        .filter(Boolean);
      if (msgs.length > 0) raw = msgs.join(', ');
    }
  }

  if (!raw) return fallback;

  return sanitizeDatabaseErrorMessage(raw);
}

export const getApiErrorMessage = extractApiErrorMessage;
