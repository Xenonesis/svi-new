// Math captcha is handled client-side in Captcha.tsx.
// No server-side token verification is needed.
export async function verifyHCaptcha(
  _token: string,
  _ip: string
): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}
