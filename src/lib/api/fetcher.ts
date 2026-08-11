/**
 * Typed fetch client for the application's API.
 *
 * - Auto-attaches `Authorization: Bearer ${token}` from `useAuthStore` when available.
 * - Throws `ApiError` on non-2xx responses with the parsed error body.
 * - Unwraps the standard `{ data: T }` envelope returned by the API.
 *
 * Usage (client):
 *   const users = await apiGet<User[]>('/api/admin/users');
 *   const created = await apiPost<{ id: string }>('/api/admin/users', { name: '...' });
 *
 * Usage (server components / route handlers — pass token explicitly):
 *   const data = await apiGet<{ ok: boolean }>('/api/health', { token });
 */

import { useAuthStore } from '@/src/stores/authStore';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions {
  /** Explicit auth token. If omitted, reads from `useAuthStore.getState().token`. */
  token?: string | null;
  /** Extra headers to merge. */
  headers?: Record<string, string>;
  /** Abort signal. */
  signal?: AbortSignal;
  /** Query params. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Skip auth header entirely (for public endpoints). */
  noAuth?: boolean;
  /** Number of retry attempts on 5xx/network errors. Default 0. */
  retries?: number;
}

interface ApiResponseEnvelope<T> {
  data: T;
}

interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

function buildUrl(path: string, params?: ApiRequestOptions['params']): string {
  if (!params) return path;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path;
}

function getToken(opts: ApiRequestOptions): string | null {
  if (opts.noAuth) return null;
  if (opts.token !== undefined) return opts.token;
  // Read from Zustand store without subscribing (avoids unnecessary re-renders).
  try {
    return useAuthStore.getState().token;
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  options: ApiRequestOptions
): Promise<T> {
  const token = getToken(options);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    ...(options.headers ?? {}),
  };

  let payload: BodyInit | null = null;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      payload = body;
      // Let the browser set the boundary.
      delete headers['Content-Type'];
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = buildUrl(path, options.params);
  const maxAttempts = (options.retries ?? 0) + 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: payload,
        signal: options.signal,
        credentials: 'include',
      });

      // 204 No Content
      if (res.status === 204) {
        return undefined as T;
      }

      const text = await res.text();
      const parsed = text ? safeJsonParse(text) : null;

      if (!res.ok) {
        const err = parsed as ApiErrorEnvelope | null;
        throw new ApiError(
          res.status,
          err?.error?.code ?? 'UNKNOWN',
          err?.error?.message ?? res.statusText,
          err?.error?.details
        );
      }

      // Unwrap standard envelope when present.
      if (parsed && typeof parsed === 'object' && 'data' in parsed) {
        return (parsed as ApiResponseEnvelope<T>).data;
      }
      return parsed as T;
    } catch (err) {
      lastError = err;
      if (err instanceof ApiError) throw err; // Don't retry app errors
      if (attempt >= maxAttempts) throw err;
      // Exponential backoff with small jitter.
      await new Promise((r) => setTimeout(r, 150 * attempt + Math.random() * 50));
    }
  }
  throw lastError;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function apiGet<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>('GET', path, undefined, options ?? {});
}

export function apiPost<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
  return request<T>('POST', path, body, options ?? {});
}

export function apiPut<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
  return request<T>('PUT', path, body, options ?? {});
}

export function apiPatch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
  return request<T>('PATCH', path, body, options ?? {});
}

export function apiDelete<T = void>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>('DELETE', path, undefined, options ?? {});
}
