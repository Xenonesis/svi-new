import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import {
  JAIPUR_PAGE_KEYWORDS,
  JAIPUR_PAGE_META,
  JAIPUR_CONTACT,
  JAIPUR_PROJECTS,
  JAIPUR_FAQS_EN,
  JAIPUR_FAQS_HI,
  JAIPUR_FAQS,
  CORRIDORS_LIST,
  JAIPUR_TRUST_BADGES,
  JAIPUR_HERO_QUICK_LINKS,
  JAIPUR_PLACE_SCHEMA,
  JAIPUR_LISTING_SCHEMA,
} from '@/src/components/plots/jaipur/jaipurPlotsData';
import { JaipurPlotsHero } from '@/src/components/plots/jaipur/JaipurPlotsHero';
import { JaipurProjectsInventoryGrid } from '@/src/components/plots/jaipur/JaipurProjectsInventoryGrid';
import { JaipurCorridorDiscoveryHub } from '@/src/components/plots/jaipur/JaipurCorridorDiscoveryHub';
import { JaipurPlotsFaqSection } from '@/src/components/plots/jaipur/JaipurPlotsFaqSection';

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

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('Jaipur Plots Data Module (jaipurPlotsData)', () => {
  it('provides complete keywords and metadata structures', () => {
    expect(JAIPUR_PAGE_KEYWORDS.length).toBeGreaterThan(25);
    expect(JAIPUR_PAGE_KEYWORDS).toContain('Plots in Jaipur');
    expect(JAIPUR_PAGE_META.titleEn).toContain('Plots in Jaipur');
    expect(JAIPUR_PAGE_META.titleHi).toContain('जयपुर में प्लॉट्स');
    expect(JAIPUR_CONTACT.phone).toBe('+917300007643');
    expect(JAIPUR_CONTACT.displayPhone).toBe('+91-73000-07643');
  });

  it('contains matched English and Hindi FAQ lists of 5 items each', () => {
    expect(JAIPUR_FAQS_EN).toHaveLength(5);
    expect(JAIPUR_FAQS_HI).toHaveLength(5);
    expect(JAIPUR_FAQS).toEqual(JAIPUR_FAQS_EN);
    JAIPUR_FAQS_EN.forEach((faq) => {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    });
    JAIPUR_FAQS_HI.forEach((faq) => {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    });
  });

  it('contains 3 featured projects with complete attributes', () => {
    expect(JAIPUR_PROJECTS).toHaveLength(3);
    JAIPUR_PROJECTS.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.titleHi).toBeTruthy();
      expect(p.corridor).toBeTruthy();
      expect(p.img).toBeTruthy();
      expect(p.href).toBeTruthy();
      expect(p.brochureUrl).toBeTruthy();
      expect(p.highlights.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('contains corridors list, trust badges, and quick links', () => {
    expect(CORRIDORS_LIST).toHaveLength(3);
    expect(JAIPUR_TRUST_BADGES).toHaveLength(4);
    expect(JAIPUR_HERO_QUICK_LINKS).toHaveLength(3);
  });

  it('contains valid Place and Listing schema configurations', () => {
    expect(JAIPUR_PLACE_SCHEMA.addressLocality).toBe('Jaipur');
    expect(JAIPUR_PLACE_SCHEMA.latitude).toBe(26.9124);
    expect(JAIPUR_LISTING_SCHEMA.location).toBe('Jaipur, Rajasthan');
    expect(JAIPUR_LISTING_SCHEMA.status).toBe('InStock');
  });
});

describe('JaipurPlotsHero', () => {
  it('renders English headline, quick links, action buttons, and trust badges', () => {
    render(<JaipurPlotsHero isHindi={false} />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Residential Plots & Gated Townships in Jaipur/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/100% Clear Title Registry Plots/i)).toBeInTheDocument();
    expect(screen.getByText('View Available Plots')).toBeInTheDocument();
    expect(screen.getByText('+91-73000-07643')).toBeInTheDocument();
    expect(screen.getByText('100% Clear Title')).toBeInTheDocument();
    expect(screen.getByText('Zero Dispute')).toBeInTheDocument();
    expect(screen.getByText('Free AC Cab Visit')).toBeInTheDocument();
  });

  it('renders Hindi headline, badges, and action buttons', () => {
    render(<JaipurPlotsHero isHindi={true} />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /जयपुर में सत्यापित आवासीय प्लॉट्स व गेटेड टाउनशिप्स/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/100% स्पष्ट रजिस्ट्री प्लॉट्स/i)).toBeInTheDocument();
    expect(screen.getByText('उपलब्ध प्लॉट्स देखें')).toBeInTheDocument();
    expect(screen.getByText('100% स्पष्ट दस्तावेज़')).toBeInTheDocument();
    expect(screen.getByText('सुरक्षित निवेश')).toBeInTheDocument();
    expect(screen.getByText('फ्री कैब साइट विजिट')).toBeInTheDocument();
  });
});

describe('JaipurProjectsInventoryGrid', () => {
  it('renders English section titles and project cards', () => {
    render(<JaipurProjectsInventoryGrid isHindi={false} />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Featured Plotted Townships in Jaipur/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText('Shivani Vatika 11th')).toBeInTheDocument();
    expect(screen.getByText('Shivani Vatika')).toBeInTheDocument();
    expect(screen.getByText('Shyam Aangan')).toBeInTheDocument();

    const exploreLinks = screen.getAllByText('Explore Layout');
    expect(exploreLinks.length).toBe(3);

    const pdfLinks = screen.getAllByText('PDF');
    expect(pdfLinks.length).toBe(3);
  });

  it('renders Hindi section titles and Hindi project titles', () => {
    render(<JaipurProjectsInventoryGrid isHindi={true} />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /जयपुर में हमारे प्रमुख टाउनशिप प्रोजेक्ट्स/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText('शिवानी वाटिका 11th')).toBeInTheDocument();
    expect(screen.getByText('शिवानी वाटिका')).toBeInTheDocument();
    expect(screen.getByText('श्याम आंगन')).toBeInTheDocument();
  });
});

describe('JaipurCorridorDiscoveryHub', () => {
  it('renders English corridor section and links', () => {
    render(<JaipurCorridorDiscoveryHub isHindi={false} />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Primary Jaipur Plotted Investment Corridors/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText('Plots Near Khatu Shyam Ji')).toBeInTheDocument();
    expect(screen.getByText('Plots in Phulera Smart City')).toBeInTheDocument();
    expect(screen.getByText('Plots Near Renwal Station')).toBeInTheDocument();
    expect(screen.getByText('NHAI 4-Lane Belt')).toBeInTheDocument();
    expect(screen.getByText('DMIC & DFC Freight Hub')).toBeInTheDocument();
    expect(screen.getByText('RIICO Industrial Zone')).toBeInTheDocument();

    const viewLinks = screen.getAllByText('View Corridor Plots');
    expect(viewLinks.length).toBe(3);
  });

  it('renders Hindi corridor section and titles', () => {
    render(<JaipurCorridorDiscoveryHub isHindi={true} />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /जयपुर क्षेत्र के प्रमुख निवेश गलियारे/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText('खाटू श्याम जी के पास प्लॉट्स')).toBeInTheDocument();
    expect(screen.getByText('फुलेरा स्मार्ट सिटी में प्लॉट्स')).toBeInTheDocument();
    expect(screen.getByText('रेनवाल रेलवे स्टेशन के पास प्लॉट्स')).toBeInTheDocument();

    const viewLinks = screen.getAllByText('विस्तृत विवरण देखें');
    expect(viewLinks.length).toBe(3);
  });
});

describe('JaipurPlotsFaqSection', () => {
  it('renders English FAQ section with default FAQs', () => {
    render(<JaipurPlotsFaqSection isHindi={false} />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Frequently Asked Questions About Plots in Jaipur/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Are residential plots in Jaipur legally verified with clear registry documentation?'
      )
    ).toBeInTheDocument();
  });

  it('renders Hindi FAQ section with Hindi FAQs', () => {
    render(<JaipurPlotsFaqSection isHindi={true} />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /जयपुर में प्लॉट्स के बारे में अक्सर पूछे जाने वाले प्रश्न/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'क्या जयपुर में आवासीय प्लॉट्स कानूनी रूप से सत्यापित और स्पष्ट रजिस्ट्री दस्तावेज़ों के साथ हैं?'
      )
    ).toBeInTheDocument();
  });

  it('renders custom faqs when provided', () => {
    const customFaqs = [
      { question: 'Custom Question 1?', answer: 'Custom Answer 1' },
      { question: 'Custom Question 2?', answer: 'Custom Answer 2' },
    ];
    render(<JaipurPlotsFaqSection isHindi={false} faqs={customFaqs} />);

    expect(screen.getByText('Custom Question 1?')).toBeInTheDocument();
    expect(screen.getByText('Custom Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Question 2?')).toBeInTheDocument();
    expect(screen.getByText('Custom Answer 2')).toBeInTheDocument();
  });
});
