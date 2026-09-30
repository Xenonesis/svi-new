import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import DotField from '@/src/components/ui/DotField';

describe('DotField component', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let originalRAF: typeof window.requestAnimationFrame;
  let originalCAF: typeof window.cancelAnimationFrame;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalRAF = window.requestAnimationFrame;
    originalCAF = window.cancelAnimationFrame;

    // Mock HTMLCanvasElement.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    // Mock getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 1000,
      height: 800,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 800,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
    vi.restoreAllMocks();
  });

  it('renders statically on touch devices without continuous RAF loop or setInterval', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('pointer: coarse') || query.includes('hover: hover') === false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const rafSpy = vi.fn();
    window.requestAnimationFrame = rafSpy;
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    const { container } = render(
      <div style={{ width: '1000px', height: '800px' }}>
        <DotField fixed={true} />
      </div>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    // On touch devices, RAF and setInterval are NOT scheduled
    expect(rafSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('sleeps on desktop when idle and wakes up on mousemove', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('hover: hover'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const rafSpy = vi.fn().mockReturnValue(123);
    window.requestAnimationFrame = rafSpy;
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    render(
      <div style={{ width: '1000px', height: '800px' }}>
        <DotField fixed={true} />
      </div>
    );

    // Initial desktop state: sleeps immediately since waveAmplitude=0 and sparkle=false
    expect(rafSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();

    // Trigger mouse move
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 200 }));
    });

    // Should wake up and schedule RAF and interval
    expect(rafSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalled();
  });

  it('resumes animation when continuous animation is requested via props', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('hover: hover'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const rafSpy = vi.fn().mockReturnValue(123);
    window.requestAnimationFrame = rafSpy;
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    render(
      <div style={{ width: '1000px', height: '800px' }}>
        <DotField fixed={true} sparkle={true} />
      </div>
    );

    // With sparkle=true, animation loop starts immediately
    expect(rafSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalled();
  });
});
