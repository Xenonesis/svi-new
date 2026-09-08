import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from '@/src/lib/haptics';

describe('triggerHaptic Utility', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('safely no-ops when navigator.vibrate is not available', () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    expect(() => triggerHaptic('light')).not.toThrow();
  });

  it('triggers a 10ms vibration for light and selection feedback', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    triggerHaptic('light');
    expect(vibrateMock).toHaveBeenCalledWith(10);

    triggerHaptic('selection');
    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it('triggers a 20ms vibration for medium feedback', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    triggerHaptic('medium');
    expect(vibrateMock).toHaveBeenCalledWith(20);
  });

  it('triggers a multi-pulse vibration array for heavy feedback', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    triggerHaptic('heavy');
    expect(vibrateMock).toHaveBeenCalledWith([25, 50, 25]);
  });

  it('swallows errors if navigator.vibrate throws', () => {
    const vibrateMock = vi.fn().mockImplementation(() => {
      throw new Error('Vibration permission denied');
    });
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    expect(() => triggerHaptic('light')).not.toThrow();
  });
});
