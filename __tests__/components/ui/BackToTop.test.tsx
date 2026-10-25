import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BackToTop from '@/src/components/ui/BackToTop';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('BackToTop passive sentinel and scroll listener', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches passive scroll listener without creating IntersectionObserver sentinel', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const mockObserver = vi.fn();
    vi.stubGlobal('IntersectionObserver', mockObserver);

    render(<BackToTop />);

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    });
    expect(mockObserver).not.toHaveBeenCalled();
  });

  it('toggles visibility based on window.scrollY > 400', () => {
    render(<BackToTop />);
    const button = screen.getByRole('button', { name: 'common.backToTop' });

    expect(button).toHaveStyle({ opacity: '0' });

    // Scroll past 400
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 450, writable: true });
      fireEvent.scroll(window);
    });

    expect(button).toHaveStyle({ opacity: '1' });

    // Scroll back up
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      fireEvent.scroll(window);
    });

    expect(button).toHaveStyle({ opacity: '0' });
  });

  it('cleans up scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BackToTop />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
