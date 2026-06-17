/**
 * Returns density-based Tailwind class strings derived from the isCompact prop.
 * All settings tabs use this instead of recomputing the same three variables.
 */
export const getSettingsDensity = (isCompact: boolean) => ({
  densityPadding: isCompact ? 'py-1.5 px-3' : 'py-2.5 px-4',
  densityGridGap: isCompact ? 'gap-3.5' : 'gap-5',
  densitySecSpacing: isCompact ? 'space-y-4' : 'space-y-6',
});

/** Builds the settings tab input class string with the correct density padding. */
export const getSettingsInputClass = (densityPadding: string) =>
  `w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all outline-none font-sans ${densityPadding}`;

/** Standard label class for all settings tab form fields. */
export const SETTINGS_LABEL_CLASS =
  'mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase font-sans';

export const getUserAgentInfo = () => {
  if (typeof window === 'undefined') {
    return { os: 'Windows PC', browser: 'Google Chrome', isMobile: false };
  }
  const ua = navigator.userAgent;
  let os = 'Windows PC';
  let browser = 'Google Chrome';
  let isMobile = false;

  if (/windows/i.test(ua)) os = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS Device';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS Device';
  else if (/android/i.test(ua)) os = 'Android Device';
  else if (/linux/i.test(ua)) os = 'Linux PC';

  if (/mobile/i.test(ua)) isMobile = true;

  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) browser = 'Google Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { os, browser, isMobile };
};
