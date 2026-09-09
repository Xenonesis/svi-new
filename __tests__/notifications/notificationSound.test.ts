import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  playNotificationChime,
  playTestTone,
} from '@/src/lib/notifications/notificationSound';

describe('notificationSound', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to true when nothing is in localStorage', () => {
    expect(isNotificationSoundEnabled()).toBe(true);
  });

  it('toggles sound preference in localStorage', () => {
    setNotificationSoundEnabled(false);
    expect(isNotificationSoundEnabled()).toBe(false);

    setNotificationSoundEnabled(true);
    expect(isNotificationSoundEnabled()).toBe(true);
  });

  it('invokes Web Audio API oscillator on playTestTone and respects toggle on playNotificationChime', () => {
    const mockStart = vi.fn();
    const mockStop = vi.fn();
    const mockConnect = vi.fn();
    const mockSetValueAtTime = vi.fn();
    const mockLinearRampToValueAtTime = vi.fn();
    const mockExponentialRampToValueAtTime = vi.fn();
    const mockClose = vi.fn().mockResolvedValue(undefined);

    const mockOscillator = {
      type: 'sine',
      frequency: { setValueAtTime: mockSetValueAtTime },
      connect: mockConnect,
      start: mockStart,
      stop: mockStop,
    };

    const mockGain = {
      gain: {
        setValueAtTime: mockSetValueAtTime,
        linearRampToValueAtTime: mockLinearRampToValueAtTime,
        exponentialRampToValueAtTime: mockExponentialRampToValueAtTime,
      },
      connect: mockConnect,
    };

    class MockAudioContext {
      state = 'running';
      currentTime = 0;
      destination = {};
      createOscillator = vi.fn(() => mockOscillator);
      createGain = vi.fn(() => mockGain);
      close = mockClose;
    }

    vi.stubGlobal('AudioContext', MockAudioContext);

    // 1. playTestTone always plays
    playTestTone();
    expect(mockStart).toHaveBeenCalled();

    // 2. playNotificationChime respects disabled sound
    setNotificationSoundEnabled(false);
    mockStart.mockClear();
    playNotificationChime();
    expect(mockStart).not.toHaveBeenCalled();

    // 3. playNotificationChime plays when enabled
    setNotificationSoundEnabled(true);
    playNotificationChime();
    expect(mockStart).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
