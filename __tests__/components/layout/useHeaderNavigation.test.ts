import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHeaderNavigation } from '@/src/components/layout/useHeaderNavigation';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/src/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/src/lib/hooks/useLotteryVisibility', () => ({
  useLotteryVisibility: () => ({ visible: true }),
}));

const setScrollY = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
};

describe('useHeaderNavigation scroll hysteresis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setScrollY(0);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes isScrolled to false at top of page', () => {
    setScrollY(0);
    const { result } = renderHook(() => useHeaderNavigation());
    expect(result.current.isScrolled).toBe(false);
  });

  it('triggers isScrolled true when scrolling past 24px', () => {
    const { result } = renderHook(() => useHeaderNavigation());

    act(() => {
      setScrollY(30);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isScrolled).toBe(true);
  });

  it('maintains isScrolled true within hysteresis zone (e.g. 15px) to eliminate jitter', () => {
    const { result } = renderHook(() => useHeaderNavigation());

    act(() => {
      setScrollY(30);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isScrolled).toBe(true);

    // Scroll back up to 15px (between 8px and 24px)
    act(() => {
      setScrollY(15);
      window.dispatchEvent(new Event('scroll'));
    });
    // Must remain true in the hysteresis band
    expect(result.current.isScrolled).toBe(true);
  });

  it('resets isScrolled false when scrolling back to the very top (less than 8px)', () => {
    const { result } = renderHook(() => useHeaderNavigation());

    act(() => {
      setScrollY(30);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isScrolled).toBe(true);

    act(() => {
      setScrollY(5);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isScrolled).toBe(false);
  });
});
