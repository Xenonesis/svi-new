import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import HeroStatCard from '@/src/components/home/hero/HeroStatCard';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('HeroStatCard mobile viewport guard', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('renders null on mobile viewports (< 1280px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { container } = render(<HeroStatCard />);
    expect(container.firstChild).toBeNull();
  });

  it('renders content on desktop viewports (>= 1280px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440,
    });

    render(<HeroStatCard />);
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('statDescription')).toBeInTheDocument();
    expect(screen.getByText('scroll')).toBeInTheDocument();
  });

  it('updates when window is resized across the 1280px threshold', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { container } = render(<HeroStatCard />);
    expect(container.firstChild).toBeNull();

    // Resize to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByText('17')).toBeInTheDocument();

    // Resize back to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.queryByText('17')).not.toBeInTheDocument();
  });

  it('cleans up resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<HeroStatCard />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
