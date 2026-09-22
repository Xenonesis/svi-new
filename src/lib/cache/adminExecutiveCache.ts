import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

interface CacheEntry {
  data: ExecutiveDashboardData;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
let cache: CacheEntry | null = null;

export function getCachedExecutiveData(): ExecutiveDashboardData | null {
  if (!cache) return null;
  const isExpired = Date.now() - cache.timestamp > CACHE_TTL_MS;
  if (isExpired) {
    cache = null;
    return null;
  }
  return cache.data;
}

export function setCachedExecutiveData(data: ExecutiveDashboardData): void {
  cache = {
    data,
    timestamp: Date.now(),
  };
}

export function clearExecutiveDashboardCache(): void {
  cache = null;
}
