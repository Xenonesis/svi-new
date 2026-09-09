const SOUND_STORAGE_KEY = 'svi_notification_sound_enabled';

/**
 * Checks if notification audio is enabled in user preferences
 */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

/**
 * Updates notification audio preference in localStorage
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Synthesizes a subtle, pleasant luxury corporate chime using Web Audio API.
 * Frequency progression: D5 (587.33 Hz) -> A5 (880.00 Hz) with exponential decay.
 */
function synthesizeChime(volume = 0.15): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      ('webkitAudioContext' in window
        ? (window['webkitAudioContext' as keyof Window] as unknown as typeof AudioContext)
        : undefined);
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Note 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.7, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Note 2: A5 (880.00 Hz) — slightly higher and brighter
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.08);

    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(volume, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.48);

    // Close AudioContext after audio finishes to conserve browser resources
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch (err) {
    console.debug('Web Audio chime playback not allowed or supported:', err);
  }
}

/**
 * Plays chime if sound is enabled
 */
export function playNotificationChime(): void {
  if (isNotificationSoundEnabled()) {
    synthesizeChime(0.12);
  }
}

/**
 * Plays sample test tone regardless of toggle state (for user testing)
 */
export function playTestTone(): void {
  synthesizeChime(0.18);
}
