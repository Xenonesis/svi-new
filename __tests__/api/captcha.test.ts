// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { issueCaptchaToken, verifyCaptchaToken } from '@/src/lib/captcha';

describe('Captcha Library', () => {
  const originalEnv = process.env.CAPTCHA_SECRET;

  beforeEach(() => {
    process.env.CAPTCHA_SECRET = 'test-secret-key-for-hmac-sha256-which-is-long-enough';
  });

  afterEach(() => {
    process.env.CAPTCHA_SECRET = originalEnv;
  });

  it('should issue a valid token and challenge', async () => {
    const { token, challenge } = await issueCaptchaToken();
    expect(token).toBeDefined();
    expect(challenge.a).toBeGreaterThan(0);
    expect(challenge.b).toBeGreaterThan(0);
    expect(token.split('.').length).toBe(5);
  });

  it('should verify a correct answer', async () => {
    const { token, challenge } = await issueCaptchaToken();
    const answer = String(challenge.a + challenge.b);
    const result = await verifyCaptchaToken(token, answer);
    expect(result).toBe(true);
  });

  it('should reject an incorrect answer', async () => {
    const { token, challenge } = await issueCaptchaToken();
    const wrongAnswer = String(challenge.a + challenge.b + 1);
    const result = await verifyCaptchaToken(token, wrongAnswer);
    expect(result).toBe(false);
  });

  it('should reject a tampered token', async () => {
    const { token, challenge } = await issueCaptchaToken();
    // Tamper with the values so it is guaranteed different from original challenge.a
    const newA = (challenge.a % 9) + 1;
    const parts = token.split('.');
    parts[2] = String(newA);
    const tamperedToken = parts.join('.');

    // Even if answer matches the new 'a', signature is invalid
    const answer = String(newA + challenge.b);
    const result = await verifyCaptchaToken(tamperedToken, answer);
    expect(result).toBe(false);
  });

  it('should reject an expired token', async () => {
    const { token, challenge } = await issueCaptchaToken();
    const answer = String(challenge.a + challenge.b);

    // Tamper with the timestamp to make it old (20 minutes ago), then resign it manually
    // to bypass the signature check and test only the expiration check.
    const parts = token.split('.');
    const oldTs = Date.now() - 20 * 60 * 1000;
    const payload = `v1.${oldTs}.${parts[2]}.${parts[3]}`;

    // We need to sign it with the same secret to test the expiration logic
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(process.env.CAPTCHA_SECRET!),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const sigHex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const expiredToken = `${payload}.${sigHex}`;

    const result = await verifyCaptchaToken(expiredToken, answer);
    expect(result).toBe(false); // Should fail because it's expired
  });

  it('should handle undefined or malformed inputs gracefully', async () => {
    expect(await verifyCaptchaToken(undefined, '5')).toBe(false);
    expect(await verifyCaptchaToken('bad.token.format', '5')).toBe(false);
    expect(await verifyCaptchaToken('v1.12345.a.b.sig', '5')).toBe(false);
  });
});
