import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyMetaWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader?.startsWith('sha256=') || !appSecret) return false;
  const suppliedHex = signatureHeader.slice('sha256='.length);
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;

  const expected = createHmac('sha256', appSecret).update(rawBody).digest();
  const supplied = Buffer.from(suppliedHex, 'hex');
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
