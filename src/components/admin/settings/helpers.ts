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
