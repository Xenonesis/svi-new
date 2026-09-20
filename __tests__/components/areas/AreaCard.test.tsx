import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  AreaCard,
  AREA_VISUALS,
  DEFAULT_AREA_VISUAL,
  type AreaVisual,
} from '@/src/components/areas/AreaCard';
import type { AreaInfo } from '@/src/data/areas';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    sizes,
    className,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill ? 'true' : undefined}
      {...rest}
    />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}));

const mockAreaKhatu: AreaInfo = {
  slug: 'khatu-shyam-highway',
  name: 'Jaipur to Khatu Shyam Ji Highway - Harsholi',
  title: 'Premier Plotted Township on Jaipur – Khatu Shyam Ji Highway (Harsholi)',
  description:
    'Direct highway corridor connecting Jaipur to the sacred Khatu Shyam Dham, adjacent to RIICO Industrial Area and Renwal Railway Station.',
  metaTitle: 'Plots on Jaipur to Khatu Shyam Ji Highway Harsholi | SVI Infra',
  metaDescription: 'Explore Shivani Vatika 11th on Jaipur to Khatu Shyam Ji Highway - Harsholi.',
  metaTitleHi: 'जयपुर से खाटू श्याम जी हाईवे हरसोली में प्लॉट्स | SVI Infra',
  metaDescriptionHi:
    'जयपुर से खाटू श्याम जी हाईवे - हरसोली (शिवानी वाटिका 11th) में आवासीय भूखंड। रीको औद्योगिक क्षेत्र और रेणवाल रेलवे स्टेशन के पास।',
  highlights: [
    'Direct frontage on Jaipur - Khatu Shyam Ji Highway',
    '1 km from 64-acre RIICO Industrial Area with 155+ planned units',
    '7 km from Renwal Railway Station (RNW) with direct Jaipur-Delhi trains',
    'Gated community with 24/7 security, boundary wall, and CCTV',
  ],
  content: 'Highway corridor content...',
  projects: ['shivani-vatika-11th'],
};

const mockAreaNoHi: AreaInfo = {
  slug: 'unknown-corridor',
  name: 'Unknown Corridor',
  title: 'Future Growth Corridor',
  description: 'A promising corridor with high appreciation potential.',
  metaTitle: 'Plots in Unknown Corridor | SVI Infra',
  metaDescription: 'Explore plots in unknown corridor.',
  highlights: ['Feature 1: Highway proximity', 'Feature 2: RERA registered'],
  content: 'Corridor overview content...',
  projects: [],
};

describe('AreaCard', () => {
  it('renders English corridor details, badges, highlights, and CTA correctly', () => {
    render(<AreaCard area={mockAreaKhatu} isHindi={false} />);

    // Area name & subtitle
    expect(screen.getByText('Jaipur to Khatu Shyam Ji Highway - Harsholi')).toBeDefined();
    expect(
      screen.getByText('Premier Plotted Township on Jaipur – Khatu Shyam Ji Highway (Harsholi)')
    ).toBeDefined();
    expect(screen.getByText(/Direct highway corridor connecting Jaipur/i)).toBeDefined();

    // Badge in English
    expect(screen.getByText('Sacred Growth Corridor')).toBeDefined();

    // Section headings in English
    expect(screen.getByText('Key Advantages')).toBeDefined();
    expect(screen.getByText('Associated Projects')).toBeDefined();

    // Highlights (first 3 rendered)
    expect(screen.getByText('Direct frontage on Jaipur - Khatu Shyam Ji Highway')).toBeDefined();
    expect(
      screen.getByText('1 km from 64-acre RIICO Industrial Area with 155+ planned units')
    ).toBeDefined();
    expect(
      screen.getByText('7 km from Renwal Railway Station (RNW) with direct Jaipur-Delhi trains')
    ).toBeDefined();
    // 4th highlight should not be rendered
    expect(
      screen.queryByText('Gated community with 24/7 security, boundary wall, and CCTV')
    ).toBeNull();

    // Associated projects preview
    expect(screen.getByText('Shivani Vatika 11th')).toBeDefined();

    // CTA Link
    const ctaLink = screen.getByRole('link', { name: /Explore Area Guide/i });
    expect(ctaLink).toBeDefined();
    expect(ctaLink.getAttribute('href')).toBe('/areas/khatu-shyam-highway');
  });

  it('renders Hindi title, subtitle, badges, and Hindi headings when isHindi is true', () => {
    render(<AreaCard area={mockAreaKhatu} isHindi={true} />);

    // Hindi title and subtitle
    expect(
      screen.getByText('जयपुर से खाटू श्याम जी हाईवे हरसोली में प्लॉट्स | SVI Infra')
    ).toBeDefined();
    expect(
      screen.getByText(
        'जयपुर से खाटू श्याम जी हाईवे - हरसोली (शिवानी वाटिका 11th) में आवासीय भूखंड। रीको औद्योगिक क्षेत्र और रेणवाल रेलवे स्टेशन के पास।'
      )
    ).toBeDefined();

    // Hindi badge
    expect(screen.getByText('पवित्र तीर्थ कॉरिडोर')).toBeDefined();

    // Hindi section headings
    expect(screen.getByText('मुख्य विशेषताएं')).toBeDefined();
    expect(screen.getByText('टाउनशिप प्रोजेक्ट्स')).toBeDefined();

    // Hindi CTA
    const ctaLink = screen.getByRole('link', { name: /पूरा क्षेत्र गाइड देखें/i });
    expect(ctaLink).toBeDefined();
    expect(ctaLink.getAttribute('href')).toBe('/areas/khatu-shyam-highway');
  });

  it('falls back to name and title when Hindi meta titles are missing', () => {
    render(<AreaCard area={mockAreaNoHi} isHindi={true} />);

    expect(screen.getByText('Unknown Corridor')).toBeDefined();
    expect(screen.getByText('Future Growth Corridor')).toBeDefined();
  });

  it('uses custom visual when provided via props', () => {
    const customVisual: AreaVisual = {
      image: '/custom/corridor.webp',
      badge: { en: 'Custom Corridor', hi: 'कस्टम कॉरिडोर' },
      projectsPreview: [{ name: 'Custom Township', slug: 'custom-township' }],
    };

    render(<AreaCard area={mockAreaKhatu} isHindi={false} visual={customVisual} />);

    expect(screen.getByText('Custom Corridor')).toBeDefined();
    expect(screen.getByText('Custom Township')).toBeDefined();
    const img = screen.getByAltText(mockAreaKhatu.name);
    expect(img.getAttribute('src')).toBe('/custom/corridor.webp');
  });

  it('falls back to DEFAULT_AREA_VISUAL when area slug is not in AREA_VISUALS', () => {
    render(<AreaCard area={mockAreaNoHi} isHindi={false} />);

    expect(screen.getByText(DEFAULT_AREA_VISUAL.badge.en)).toBeDefined();
    const img = screen.getByAltText(mockAreaNoHi.name);
    expect(img.getAttribute('src')).toBe(DEFAULT_AREA_VISUAL.image);
    // When projectsPreview is empty, the preview box is not rendered
    expect(screen.queryByText('Associated Projects')).toBeNull();
  });
});
