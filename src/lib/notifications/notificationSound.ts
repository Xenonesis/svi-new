const SOUND_STORAGE_KEY = 'svi_notification_sound_enabled';
const SOUND_TONE_STORAGE_KEY = 'svi_notification_sound_tone';

export type SoundTone = 'chime' | 'bell' | 'marimba' | 'ping' | 'pop' | 'ascend';

export interface SoundOption {
  id: SoundTone;
  name: string;
  description: string;
  badge: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'chime',
    name: 'Classic Gold Chime',
    description: 'Subtle luxury two-tone chime (D5 → A5)',
    badge: 'Default',
  },
  {
    id: 'bell',
    name: 'Crystal Bell',
    description: 'Crisp, high-clarity executive crystal bell',
    badge: 'Crisp',
  },
  {
    id: 'marimba',
    name: 'Warm Marimba',
    description: 'Soft corporate 3-note harmonic triad',
    badge: 'Mellow',
  },
  {
    id: 'ping',
    name: 'Minimal Tech Ping',
    description: 'Discreet, clean modern pulse note',
    badge: 'Discreet',
  },
  {
    id: 'pop',
    name: 'Modern Bubble Pop',
    description: 'Upbeat, snappy micro-interaction pop',
    badge: 'Snappy',
  },
  {
    id: 'ascend',
    name: 'Ascend Sparkle',
    description: 'Three-step upbeat positive alert (F5 → A5 → C6)',
    badge: 'Upbeat',
  },
];

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
 * Retrieves the currently selected sound tone from localStorage
 */
export function getNotificationSoundTone(): SoundTone {
  if (typeof window === 'undefined') return 'chime';
  try {
    const saved = localStorage.getItem(SOUND_TONE_STORAGE_KEY) as SoundTone | null;
    if (saved && SOUND_OPTIONS.some((o) => o.id === saved)) {
      return saved;
    }
    return 'chime';
  } catch {
    return 'chime';
  }
}

/**
 * Sets the selected sound tone in localStorage
 */
export function setNotificationSoundTone(tone: SoundTone): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_TONE_STORAGE_KEY, tone);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Synthesizes a chosen tone using Web Audio API. Zero external assets required.
 */
function synthesizeSound(tone: SoundTone = 'chime', volume = 0.15): void {
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
    let duration = 0.6;

    switch (tone) {
      case 'bell': {
        // High crystal bell: C6 (1046.5 Hz) with gentle overtone E6 (1318.5 Hz)
        duration = 0.65;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.5, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(volume * 0.85, now + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.5, now);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(volume * 0.35, now + 0.015);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.45);
        break;
      }

      case 'marimba': {
        // Soft acoustic 3-note harmonic triad: C5 (523Hz), E5 (659Hz), G5 (784Hz)
        duration = 0.55;
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const noteTime = now + idx * 0.045;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle'; // warm acoustic feel
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(volume * 0.7, noteTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.35);
        });
        break;
      }

      case 'ping': {
        // Minimalist tech pulse: single clean pure sine note with rapid decay
        duration = 0.35;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume * 0.9, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'pop': {
        // Modern crisp bubble pop: rapid frequency rise 380Hz -> 820Hz in 55ms
        duration = 0.25;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.055);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume * 1.1, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'ascend': {
        // Upbeat three-step success tone: F5 (698Hz) -> A5 (880Hz) -> C6 (1046Hz)
        duration = 0.6;
        const freqs = [698.46, 880.0, 1046.5];
        freqs.forEach((freq, idx) => {
          const noteTime = now + idx * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(volume * (0.6 + idx * 0.15), noteTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.32);
        });
        break;
      }

      case 'chime':
      default: {
        // Classic Gold Chime: D5 (587.33 Hz) -> A5 (880.00 Hz)
        duration = 0.6;
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
        break;
      }
    }

    // Close AudioContext after audio finishes to conserve browser resources
    setTimeout(
      () => {
        ctx.close().catch(() => {});
      },
      Math.round(duration * 1000) + 150
    );
  } catch (err) {
    console.debug('Web Audio playback not allowed or supported:', err);
  }
}

/**
 * Plays chime if sound is enabled, using the user's selected tone
 */
export function playNotificationChime(): void {
  if (isNotificationSoundEnabled()) {
    synthesizeSound(getNotificationSoundTone(), 0.13);
  }
}

/**
 * Plays a sample test tone regardless of toggle state (for user testing)
 */
export function playTestTone(tone?: SoundTone): void {
  const selectedTone = tone || getNotificationSoundTone();
  synthesizeSound(selectedTone, 0.18);
}
