import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import {
  AreaHeroBanner,
  AreaGatewayCallout,
  AreaOverviewSection,
  AreaHighlightsGrid,
  AreaProjectsSection,
  AreaSidebarCard,
  PROJECT_SUMMARIES,
  COMMERCIAL_HUBS,
  AREA_INFORMATIONAL_META,
  buildAreaMetadata,
  getAreaBreadcrumbs,
  getAreaPlaceSchemaProps,
} from '@/src/components/areas/detail';
import type { AreaInfo } from '@/src/data/areas';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
    ...rest
  }: ComponentPropsWithoutRef<'img'> & { fill?: boolean; priority?: boolean }) => (
    <img src={typeof src === 'string' ? src : ''} alt={alt ?? ''} className={className} {...rest} />
  ),
}));

vi.mock('@/src/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/src/components/properties/AreaInquiryForm', () => ({
  default: ({ areaName }: { areaName: string }) => (
    <div data-testid="mock-inquiry-form">Inquiry Form for {areaName}</div>
  ),
}));

vi.mock('@/src/components/properties/EmiCalculator', () => ({
  EmiCalculator: () => <div data-testid="mock-emi-calculator">EMI Calculator</div>,
}));

const mockArea: AreaInfo = {
  slug: 'test-corridor',
  name: 'Test Corridor Area',
  title: 'Test Corridor Title',
  description: 'Test corridor description for residential and commercial plots.',
  metaTitle: 'Test Corridor Meta Title',
  metaDescription: 'Test Corridor Meta Description',
  metaTitleHi: 'टेस्ट कॉरिडोर मेटा टाइटल',
  metaDescriptionHi: 'टेस्ट कॉरिडोर मेटा विवरण',
  content: 'Comprehensive description of the test corridor development.',
  highlights: ['30ft wide internal roads', 'Direct highway frontage', 'Gated township'],
  projects: ['shivani-vatika-11th'],
  geo: {
    latitude: 27.13,
    longitude: 75.42,
    addressLocality: 'Renwal, Jaipur',
    postalCode: '303603',
    addressRegion: 'Rajasthan',
  },
};

describe('Area Detail Data & Helpers (areaDetailData)', () => {
  it('buildAreaMetadata returns accurate metadata for configured informational hubs', () => {
    const metaEn = buildAreaMetadata('khatu-shyam-highway', 'en');
    expect(metaEn.title).toBe(AREA_INFORMATIONAL_META['khatu-shyam-highway'].title.en);
    expect(metaEn.description).toBe(AREA_INFORMATIONAL_META['khatu-shyam-highway'].description.en);

    const metaHi = buildAreaMetadata('khatu-shyam-highway', 'hi');
    expect(metaHi.title).toBe(AREA_INFORMATIONAL_META['khatu-shyam-highway'].title.hi);
    expect(metaHi.description).toBe(AREA_INFORMATIONAL_META['khatu-shyam-highway'].description.hi);
  });

  it('buildAreaMetadata falls back to area default meta when not in informational dictionary', () => {
    const metaTonkEn = buildAreaMetadata('tonk-road-jaipur', 'en');
    expect(metaTonkEn.title).toContain('Shivani Vatika');

    const metaTonkHi = buildAreaMetadata('tonk-road-jaipur', 'hi');
    expect(metaTonkHi.title).toContain('शिवानी वाटिका');
  });

  it('buildAreaMetadata returns Area Not Found for invalid slug', () => {
    const metaNotFound = buildAreaMetadata('non-existent-area-xyz', 'en');
    expect(metaNotFound.title).toBe('Area Not Found');
  });

  it('getAreaBreadcrumbs builds correct items in English and Hindi', () => {
    const crumbsEn = getAreaBreadcrumbs('Renwal Hub', 'renwal', false);
    expect(crumbsEn).toEqual([
      { name: 'Home', item: '/' },
      { name: 'Areas', item: '/areas' },
      { name: 'Renwal Hub', item: '/areas/renwal' },
    ]);

    const crumbsHi = getAreaBreadcrumbs('Renwal Hub', 'renwal', true);
    expect(crumbsHi).toEqual([
      { name: 'Home', item: '/' },
      { name: 'क्षेत्र', item: '/areas' },
      { name: 'Renwal Hub', item: '/areas/renwal' },
    ]);
  });

  it('getAreaPlaceSchemaProps extracts geo coordinates and locality correctly', () => {
    const props = getAreaPlaceSchemaProps(mockArea, 'https://example.com/areas/test-corridor');
    expect(props.name).toBe('Test Corridor Area');
    expect(props.description).toBe(mockArea.description);
    expect(props.latitude).toBe(27.13);
    expect(props.longitude).toBe(75.42);
    expect(props.addressLocality).toBe('Renwal, Jaipur');
    expect(props.postalCode).toBe('303603');
    expect(props.addressRegion).toBe('Rajasthan');
  });

  it('verifies PROJECT_SUMMARIES and COMMERCIAL_HUBS configuration integrity', () => {
    expect(PROJECT_SUMMARIES['shivani-vatika-11th']).toBeDefined();
    expect(PROJECT_SUMMARIES['shivani-vatika-11th'].title).toBe('Shivani Vatika 11th');

    expect(COMMERCIAL_HUBS['khatu-shyam-highway']).toBeDefined();
    expect(COMMERCIAL_HUBS['khatu-shyam-highway'].href).toBe('/plots-for-sale-near-khatu-shyam-ji');
    expect(COMMERCIAL_HUBS['phulera-smart-city']).toBeDefined();
  });
});

describe('AreaHeroBanner Component', () => {
  it('renders correctly with an area object in English', () => {
    render(<AreaHeroBanner area={mockArea} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockArea.title);
    expect(screen.getByText(mockArea.description)).toBeInTheDocument();
    expect(screen.getByText('Featured Location')).toBeInTheDocument();
  });

  it('renders Hindi badge and custom image when specified', () => {
    render(
      <AreaHeroBanner
        name="खाटू हाईवे"
        title="खाटू श्याम जी हाईवे टाउनशिप"
        description="प्राइम हाईवे प्लॉट्स"
        isHindi={true}
        imageSrc="/images/custom-hero.webp"
      />
    );
    expect(screen.getByText('विशेष स्थान')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'खाटू श्याम जी हाईवे टाउनशिप'
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/custom-hero.webp');
  });

  it('allows custom badge override', () => {
    render(<AreaHeroBanner area={mockArea} badgeText="High Growth Corridor" />);
    expect(screen.getByText('High Growth Corridor')).toBeInTheDocument();
  });
});

describe('AreaGatewayCallout Component', () => {
  const khatuHub = COMMERCIAL_HUBS['khatu-shyam-highway'];

  it('returns null when commercialHub is not provided or null', () => {
    const { container } = render(<AreaGatewayCallout commercialHub={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders English gateway callout banner with link and headline', () => {
    render(<AreaGatewayCallout commercialHub={khatuHub} isHindi={false} />);
    expect(screen.getByText(khatuHub.badge.en)).toBeInTheDocument();
    expect(screen.getByText(khatuHub.headline.en)).toBeInTheDocument();
    expect(screen.getByText(khatuHub.description.en)).toBeInTheDocument();
    expect(screen.getByText(khatuHub.ctaText.en)).toBeInTheDocument();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', khatuHub.href);
  });

  it('renders Hindi gateway callout banner with Hindi copy', () => {
    render(<AreaGatewayCallout commercialHub={khatuHub} isHindi={true} />);
    expect(screen.getByText(khatuHub.badge.hi)).toBeInTheDocument();
    expect(screen.getByText(khatuHub.headline.hi)).toBeInTheDocument();
    expect(screen.getByText(khatuHub.description.hi)).toBeInTheDocument();
    expect(screen.getByText(khatuHub.ctaText.hi)).toBeInTheDocument();
  });
});

describe('AreaOverviewSection Component', () => {
  it('renders default English title and content', () => {
    render(<AreaOverviewSection content={mockArea.content} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Neighborhood Overview');
    expect(screen.getByText(mockArea.content)).toBeInTheDocument();
  });

  it('renders Hindi title when isHindi is true', () => {
    render(<AreaOverviewSection content={mockArea.content} isHindi={true} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('पड़ोस का अवलोकन');
  });

  it('renders custom title override', () => {
    render(<AreaOverviewSection content={mockArea.content} title="Corridor Strategic Analysis" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Corridor Strategic Analysis'
    );
  });
});

describe('AreaHighlightsGrid Component', () => {
  it('returns null when highlights array is empty', () => {
    const { container } = render(<AreaHighlightsGrid highlights={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all highlights and default English title', () => {
    render(<AreaHighlightsGrid highlights={mockArea.highlights} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Key Area Highlights');
    expect(screen.getByText('30ft wide internal roads')).toBeInTheDocument();
    expect(screen.getByText('Direct highway frontage')).toBeInTheDocument();
    expect(screen.getByText('Gated township')).toBeInTheDocument();
  });

  it('renders localized Hindi title when isHindi is true', () => {
    render(<AreaHighlightsGrid highlights={mockArea.highlights} isHindi={true} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'क्षेत्र की मुख्य विशेषताएं'
    );
  });
});

describe('AreaProjectsSection Component', () => {
  it('renders project cards matching projectIds', () => {
    render(<AreaProjectsSection areaName={mockArea.name} projectIds={['shivani-vatika-11th']} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      `Our Projects in ${mockArea.name}`
    );
    expect(screen.getByText('Shivani Vatika 11th')).toBeInTheDocument();
    expect(screen.getByText('Premier Residential Plots')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Explore Details')).toBeInTheDocument();
  });

  it('renders Hindi title and CTA text when isHindi is true', () => {
    render(
      <AreaProjectsSection
        areaName="खाटू श्याम जी हाईवे"
        projectIds={['shivani-vatika-11th']}
        isHindi={true}
      />
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'खाटू श्याम जी हाईवे में हमारी परियोजनाएं'
    );
    expect(screen.getByText('विवरण देखें')).toBeInTheDocument();
  });

  it('ignores projectIds without matching summaries', () => {
    render(
      <AreaProjectsSection areaName={mockArea.name} projectIds={['non-existent-project-id']} />
    );
    expect(screen.queryByText('Explore Details')).not.toBeInTheDocument();
  });
});

describe('AreaSidebarCard Component', () => {
  it('renders registration form and EMI calculator without commercial hub', () => {
    render(<AreaSidebarCard areaName={mockArea.name} commercialHub={null} />);
    expect(screen.getByText(`Register for ${mockArea.name}`)).toBeInTheDocument();
    expect(screen.getByTestId('mock-inquiry-form')).toHaveTextContent(
      `Inquiry Form for ${mockArea.name}`
    );
    expect(screen.getByTestId('mock-emi-calculator')).toBeInTheDocument();
    expect(screen.queryByText('Commercial Plots Hub')).not.toBeInTheDocument();
  });

  it('renders commercial hub banner when provided in sidebar', () => {
    const khatuHub = COMMERCIAL_HUBS['khatu-shyam-highway'];
    render(<AreaSidebarCard areaName={mockArea.name} commercialHub={khatuHub} />);
    expect(screen.getByText('Commercial Plots Hub')).toBeInTheDocument();
    expect(screen.getByText(khatuHub.headline.en)).toBeInTheDocument();
    expect(screen.getByText('View Available Plots')).toBeInTheDocument();
  });

  it('renders Hindi headings and commercial banner copy when isHindi is true', () => {
    const khatuHub = COMMERCIAL_HUBS['khatu-shyam-highway'];
    render(<AreaSidebarCard areaName="खाटू हाईवे" commercialHub={khatuHub} isHindi={true} />);
    expect(screen.getByText('खाटू हाईवे के लिए पंजीकरण करें')).toBeInTheDocument();
    expect(screen.getByText('कमर्शियल हब')).toBeInTheDocument();
    expect(screen.getByText(khatuHub.headline.hi)).toBeInTheDocument();
    expect(screen.getByText('उपलब्ध प्लॉट्स देखें')).toBeInTheDocument();
  });
});
