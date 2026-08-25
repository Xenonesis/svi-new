/**
 * Universal error message extractor.
 * Safely parses any error format (ApiError, standard Error, JSON error objects,
 * Zod validation arrays, Supabase errors, or string messages) into a human-readable string.
 * Prevents `[object Object]` from ever appearing in the UI.
 */
export function extractApiErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  if (!error) return fallback;

  // 1. If error is already a string
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed && trimmed !== '[object Object]') {
      return trimmed;
    }
    return fallback;
  }

  // 2. If error is an Error instance
  if (error instanceof Error) {
    const msg = error.message;
    if (msg && msg !== '[object Object]') {
      return msg;
    }
  }

  // 3. If error is an object (e.g. parsed JSON from API response or Supabase error object)
  if (typeof error === 'object') {
    const errObj = error as Record<string, any>;

    // Case: { error: { message: "...", details: ... } } or { error: "..." }
    if (errObj.error !== undefined && errObj.error !== null) {
      if (typeof errObj.error === 'string') {
        const trimmed = errObj.error.trim();
        if (trimmed && trimmed !== '[object Object]') return trimmed;
      }

      if (typeof errObj.error === 'object') {
        const nested = errObj.error;
        if (
          nested.message &&
          typeof nested.message === 'string' &&
          nested.message !== '[object Object]'
        ) {
          // If details are present as array of items or zod errors
          if (Array.isArray(nested.details) && nested.details.length > 0) {
            const detailStrs = nested.details
              .map((d: any) => {
                if (typeof d === 'string') return d;
                if (d && typeof d === 'object') {
                  const field = d.path
                    ? `Field "${Array.isArray(d.path) ? d.path.join('.') : d.path}": `
                    : '';
                  return `${field}${d.message || JSON.stringify(d)}`;
                }
                return String(d);
              })
              .filter(Boolean);
            if (detailStrs.length > 0) {
              return `${nested.message} (${detailStrs.join(', ')})`;
            }
          }
          return nested.message;
        }

        if (nested.details && typeof nested.details === 'string') {
          return nested.details;
        }
      }
    }

    // Case: { message: "..." }
    if (
      errObj.message &&
      typeof errObj.message === 'string' &&
      errObj.message !== '[object Object]'
    ) {
      return errObj.message;
    }

    // Case: { msg: "..." }
    if (errObj.msg && typeof errObj.msg === 'string' && errObj.msg !== '[object Object]') {
      return errObj.msg;
    }

    // Case: { errors: [...] } (e.g. express-validator / Zod)
    if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
      const msgs = errObj.errors
        .map((e: any) => (typeof e === 'string' ? e : e?.message || JSON.stringify(e)))
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join(', ');
    }

    // Case: { details: [...] }
    if (Array.isArray(errObj.details) && errObj.details.length > 0) {
      const msgs = errObj.details
        .map((e: any) => (typeof e === 'string' ? e : e?.message || JSON.stringify(e)))
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join(', ');
    }
  }

  return fallback;
}

export const getApiErrorMessage = extractApiErrorMessage;
