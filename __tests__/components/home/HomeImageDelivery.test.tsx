import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { type ComponentPropsWithoutRef } from 'react';
import AboutSection from '@/src/components/home/AboutSection';
import HeroBackground from '@/src/components/home/hero/HeroBackground';
import { motionValue } from 'motion/react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockImageCalls: Array<Record<string, unknown>> = [];

vi.mock('next/image', () => ({
  default: (
    props: ComponentPropsWithoutRef<'img'> & {
      fill?: boolean;
      priority?: boolean;
      quality?: number;
    }
  ) => {
    mockImageCalls.push(props);
    const { src, alt, className, sizes, priority, quality, fetchPriority, loading } = props;
    return (
      <img
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        className={className}
        sizes={sizes}
        data-priority={priority ? 'true' : 'false'}
        data-quality={quality}
        data-fetchpriority={fetchPriority}
        data-loading={loading}
      />
    );
  },
}));

describe('Home Image Delivery Optimizations', () => {
  it('AboutSection renders house1.webp with tailored sizes and quality 70', () => {
    mockImageCalls.length = 0;
    render(<AboutSection />);

    const img = screen.getByAltText(/Modern luxury home exterior/i);
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/images/house1.webp');
    expect(img.getAttribute('sizes')).toBe(
      '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 600px'
    );
    expect(img.getAttribute('data-quality')).toBe('70');
    expect(img.getAttribute('data-loading')).toBe('lazy');
  });

  it('HeroBackground configures slide 0 with priority, high fetchPriority, and responsive 100vw sizes', () => {
    mockImageCalls.length = 0;
    const staticY = motionValue('0%');
    const staticScale = motionValue(1);

    const testImages = [
      { src: '/images/hero1_new.webp', alt: 'Hero 1' },
      { src: '/images/hero2_new.webp', alt: 'Hero 2' },
    ];

    render(
      <HeroBackground
        images={testImages}
        currentHeroIndex={0}
        backgroundY={staticY}
        heroScale={staticScale}
        isMobile={true}
      />
    );

    const img = screen.getByAltText('Hero 1');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/images/hero1_new.webp');
    expect(img.getAttribute('data-priority')).toBe('true');
    expect(img.getAttribute('data-fetchpriority')).toBe('high');
    expect(img.getAttribute('data-loading')).toBe('eager');
    expect(img.getAttribute('data-quality')).toBe('75');
    expect(img.getAttribute('sizes')).toBe(
      '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
    );
  });

  it('HeroBackground configures desktop slide 0 with quality 80 without 1920px over-fetching', () => {
    mockImageCalls.length = 0;
    const staticY = motionValue('0%');
    const staticScale = motionValue(1);

    const testImages = [
      { src: '/images/hero1_new.webp', alt: 'Hero 1' },
      { src: '/images/hero2_new.webp', alt: 'Hero 2' },
    ];

    render(
      <HeroBackground
        images={testImages}
        currentHeroIndex={0}
        backgroundY={staticY}
        heroScale={staticScale}
        isMobile={false}
      />
    );

    const img = screen.getByAltText('Hero 1');
    expect(img).toBeDefined();
    expect(img.getAttribute('data-quality')).toBe('80');
    expect(img.getAttribute('sizes')).toBe(
      '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
    );
    expect(img.getAttribute('sizes')).not.toContain('1920px');
  });

  it('HeroBackground configures non-zero slides with priority false and lazy loading', () => {
    mockImageCalls.length = 0;
    const staticY = motionValue('0%');
    const staticScale = motionValue(1);

    const testImages = [
      { src: '/images/hero1_new.webp', alt: 'Hero 1' },
      { src: '/images/hero2_new.webp', alt: 'Hero 2' },
    ];

    render(
      <HeroBackground
        images={testImages}
        currentHeroIndex={1}
        backgroundY={staticY}
        heroScale={staticScale}
        isMobile={false}
      />
    );

    const img = screen.getByAltText('Hero 2');
    expect(img).toBeDefined();
    expect(img.getAttribute('data-priority')).toBe('false');
    expect(img.getAttribute('data-fetchpriority')).toBe('low');
    expect(img.getAttribute('data-loading')).toBe('lazy');
  });
});
