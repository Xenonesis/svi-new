export interface SettingsCacheEntry {
  data: unknown[];
  expiresAt: number;
}

let settingsCache: SettingsCacheEntry | null = null;
const CACHE_TTL_MS = 60_000;

export function getSettingsCache(): SettingsCacheEntry | null {
  return settingsCache;
}

export function setSettingsCache(data: unknown[]): void {
  settingsCache = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export function clearSettingsCache(): void {
  settingsCache = null;
}
