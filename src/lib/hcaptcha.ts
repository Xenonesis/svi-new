const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';
const TIMEOUT_MS = 5_000;
const MAX_RETRIES = 1;

export async function verifyHCaptcha(
  token: string,
  ip: string
): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    // If captcha is disabled, skip verification
    if (process.env.NEXT_PUBLIC_DISABLE_CAPTCHA === 'true') {
      return { success: true };
    }
    return { success: false, error: 'HCAPTCHA_SECRET not configured' };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(HCAPTCHA_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: ip,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        lastError = new Error(`hCaptcha HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      return { success: data.success === true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        // Wait 500ms before retry
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Captcha verification failed',
  };
}
