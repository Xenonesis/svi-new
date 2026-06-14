import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Base fetch wrapper for API calls.
 * Handles auth, JSON parsing, and error responses.
 */
async function apiFetch<T>(
  url: string,
  method: HttpMethod = 'GET',
  body?: unknown,
  options?: ApiOptions
): Promise<T> {
  const headers: Record<string, string> = {
    ...(method !== 'GET' && body ? { 'Content-Type': 'application/json' } : {}),
    ...options?.headers,
  };

  // Add query params for GET requests
  let finalUrl = url;
  if (options?.params && method === 'GET') {
    const searchParams = new URLSearchParams(options.params);
    finalUrl += `?${searchParams.toString()}`;
  }

  const res = await fetch(finalUrl, {
    method,
    headers,
    ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error?.error?.message || error?.error || `API error: ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

/**
 * Hook for GET requests with caching.
 *
 * @example
 * const { data, isLoading } = useGetApi(['users'], '/api/admin/users');
 * const { data } = useGetApi(['lottery', id], '/api/admin/lottery/123');
 */
export function useGetApi<TData = unknown>(
  queryKey: string[],
  url: string,
  options?: ApiOptions & { enabled?: boolean; staleTime?: number; gcTime?: number }
) {
  return useQuery<TData>({
    queryKey,
    queryFn: () => apiFetch<TData>(url, 'GET', undefined, options),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
}

/**
 * Hook for paginated GET requests.
 *
 * @example
 * const { data, isLoading } = usePaginatedApi(
 *   ['registrations', page, search],
 *   '/api/admin/registrations',
 *   { page: '1', search: 'test' }
 * );
 */
export function usePaginatedApi<TData = unknown>(
  queryKey: string[],
  url: string,
  params: Record<string, string>,
  options?: { enabled?: boolean }
) {
  return useQuery<TData>({
    queryKey: [...queryKey, params],
    queryFn: () => apiFetch<TData>(url, 'GET', undefined, { params }),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook for mutations (POST, PUT, PATCH, DELETE).
 *
 * @example
 * const createUser = useApiMutation('/api/admin/users', 'POST');
 * createUser.mutate({ name: 'John' });
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  method: HttpMethod = 'POST',
  options?: {
    onSuccess?: (data: TData) => void;
    invalidateKeys?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => apiFetch<TData>(url, method, variables),
    onSuccess: (data) => {
      // Invalidate related queries for cache refresh
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options?.onSuccess?.(data);
    },
  });
}
