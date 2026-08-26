/**
 * Web Audio Melodic Chime Synthesizer
 * Generates an elegant, crystal-clear notification chime natively in the browser.
 * Zero external audio files required — immune to 404s, CORS, or network delays.
 */

class FollowUpAudioService {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      type AudioContextConstructor = new () => AudioContext;
      interface CustomWindow {
        AudioContext?: AudioContextConstructor;
        webkitAudioContext?: AudioContextConstructor;
      }
      const win = window as unknown as CustomWindow;
      const AudioContextClass = win.AudioContext || win.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Play an elegant 4-note melodic chime: C5 -> E5 -> G5 -> C6
   * Designed specifically for urgent real estate lead follow-up reminders.
   */
  public playChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Frequencies for a pleasant major arpeggio
      const notes = [
        { freq: 523.25, time: now + 0.0 }, // C5
        { freq: 659.25, time: now + 0.12 }, // E5
        { freq: 783.99, time: now + 0.24 }, // G5
        { freq: 1046.5, time: now + 0.38 }, // C6
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm sine tone with subtle triangle overtone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Exponential decay envelope
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.25, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.6);
      });

      // Mobile haptic vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 80, 150]);
      }
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  }

  /**
   * Play an alert tone for immediate overdue reminders
   */
  public playAlertTone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 880, time: now + 0.0 }, // A5
        { freq: 784, time: now + 0.15 }, // G5
        { freq: 880, time: now + 0.3 }, // A5
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.3, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.3);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([250, 100, 250]);
      }
    } catch (err) {
      console.warn('Audio alert tone error:', err);
    }
  }

  /**
   * Request native browser notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Dispatch system notification if granted
   */
  public triggerSystemNotification(title: string, body: string, url?: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
        });
        if (url) {
          notification.onclick = () => {
            window.focus();
            window.location.href = url;
          };
        }
      } catch {
        // Fallback silently if blocked
      }
    }
  }
}

export const followUpAudio = new FollowUpAudioService();
