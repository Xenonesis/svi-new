export interface UserGrowthPoint {
  date: string;
  users: number;
}

export interface DocumentStatItem {
  name: string;
  count: number;
}

export interface AnalyticsTrends {
  userGrowth: string;
  clientGrowth: string;
  adminCount: string;
}

export interface AnalyticsData {
  userGrowth: UserGrowthPoint[];
  documentStats: DocumentStatItem[];
  trends: AnalyticsTrends;
}

export interface AnalyticsCacheEntry {
  data: AnalyticsData;
  expiresAt: number;
}

let analyticsCache: AnalyticsCacheEntry | null = null;
const CACHE_TTL_MS = 60_000;

export function getAnalyticsCache(): AnalyticsCacheEntry | null {
  return analyticsCache;
}

export function setAnalyticsCache(data: AnalyticsData): void {
  analyticsCache = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export function clearAnalyticsCache(): void {
  analyticsCache = null;
}
