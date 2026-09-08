export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection';

/**
 * Triggers safe haptic feedback on devices supporting the Vibration API / Capacitor bridge.
 * Gracefully no-ops in SSR, non-supporting browsers, or when vibration is blocked.
 */
export function triggerHaptic(type: HapticFeedbackType = 'light'): void {
  if (
    typeof window === 'undefined' ||
    !('navigator' in window) ||
    typeof navigator.vibrate !== 'function'
  ) {
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate([25, 50, 25]);
        break;
    }
  } catch {
    // Gracefully ignore permission or hardware errors
  }
}
