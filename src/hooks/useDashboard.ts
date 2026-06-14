import { useGetApi, useApiMutation } from './useApi';
import type { UserProfile } from '@/src/lib/supabase/types';

// Re-export for convenience
export type { UserProfile };

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserGrowthData {
  date: string;
  users: number;
}

export interface DocumentStatsData {
  name: string;
  count: number;
}

export interface ActivityData {
  id: string;
  type: 'user' | 'document' | 'settings' | 'download';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface DashboardAnalytics {
  userGrowth: UserGrowthData[];
  documentStats: DocumentStatsData[];
  trends: {
    userGrowth: string;
    clientGrowth: string;
    adminCount: string;
  };
}

export interface UsersResponse {
  users: UserProfile[];
}

export interface ActivitiesResponse {
  activities: ActivityData[];
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch all admin users with built-in caching.
 * Users change infrequently — stale after 30s, cache for 5 min.
 */
export function useUsers(token: string | null) {
  return useGetApi<UsersResponse>(['admin', 'users'], '/api/admin/users', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    enabled: !!token,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Fetch dashboard analytics (user growth, document stats, trends).
 * Analytics change slowly — stale after 2 min, cache for 10 min.
 */
export function useAnalytics(token: string | null) {
  return useGetApi<DashboardAnalytics>(['admin', 'analytics'], '/api/admin/analytics', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    enabled: !!token,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });
}

/**
 * Fetch recent admin activities.
 * Activities update frequently — stale after 15s, cache for 2 min.
 */
export function useActivities(token: string | null, limit = 10) {
  return useGetApi<ActivitiesResponse>(
    ['admin', 'activities', String(limit)],
    `/api/admin/activities?limit=${limit}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      enabled: !!token,
      staleTime: 15_000,
      gcTime: 2 * 60_000,
    }
  );
}

/**
 * Delete a user and refresh the user list.
 */
export function useDeleteUser(token: string | null) {
  return useApiMutation<{ success: boolean }, { id: string }>(
    '', // URL set dynamically via onSuccess
    'DELETE',
    {
      invalidateKeys: [['admin', 'users']],
    }
  );
}
