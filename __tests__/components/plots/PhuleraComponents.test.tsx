import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import {
  PHULERA_PAGE_KEYWORDS,
  PHULERA_PAGE_META,
  PHULERA_CONTACT,
  PHULERA_FAQS_EN,
  PHULERA_FAQS_HI,
  COMMUTE_MATRIX,
  HERO_PILLARS,
  PHULERA_ADVANTAGES,
  TOWNSHIP_FEATURES,
  LEAD_CAPTURE_PERKS,
  PHULERA_CORRIDOR_NAME,
  PHULERA_CORRIDOR_DESC,
  PHULERA_LISTING_DESC,
} from '@/src/components/plots/phulera/phuleraData';
import { PhuleraHeroSection } from '@/src/components/plots/phulera/PhuleraHeroSection';
import { PhuleraAdvantageSection } from '@/src/components/plots/phulera/PhuleraAdvantageSection';
import { PhuleraTownshipSpotlight } from '@/src/components/plots/phulera/PhuleraTownshipSpotlight';
import { PhuleraCommuteTable } from '@/src/components/plots/phulera/PhuleraCommuteTable';
import { PhuleraFaqSection } from '@/src/components/plots/phulera/PhuleraFaqSection';
import { PhuleraLeadCaptureSection } from '@/src/components/plots/phulera/PhuleraLeadCaptureSection';

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

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Phulera Data Module (phuleraData)', () => {
  it('provides complete keywords and metadata structures', () => {
    expect(PHULERA_PAGE_KEYWORDS.length).toBeGreaterThan(20);
    expect(PHULERA_PAGE_META.titleEn).toContain('Plots for Sale in Phulera');
    expect(PHULERA_PAGE_META.titleHi).toContain('फुलेरा');
    expect(PHULERA_CONTACT.phone).toBe('+917300007643');
    expect(PHULERA_CONTACT.phoneFormatted).toBe('+91-73000-07643');
    expect(PHULERA_CONTACT.gateImage).toBe('/Shivani Vatika 11/gate.webp');
    expect(PHULERA_CORRIDOR_NAME.en).toBe('Phulera DMIC Smart City Corridor');
    expect(PHULERA_CORRIDOR_NAME.hi).toBe('फुलेरा DMIC स्मार्ट सिटी कॉरिडोर');
    expect(PHULERA_CORRIDOR_DESC.en).toBeTruthy();
    expect(PHULERA_CORRIDOR_DESC.hi).toBeTruthy();
    expect(PHULERA_LISTING_DESC).toBeTruthy();
  });

  it('contains matched English and Hindi FAQ lists of 6 items each', () => {
    expect(PHULERA_FAQS_EN).toHaveLength(6);
    expect(PHULERA_FAQS_HI).toHaveLength(6);
    PHULERA_FAQS_EN.forEach((faq) => {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    });
    PHULERA_FAQS_HI.forEach((faq) => {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    });
  });

  it('contains valid commute matrix, pillars, advantages, features, and perks', () => {
    expect(COMMUTE_MATRIX).toHaveLength(8);
    expect(HERO_PILLARS).toHaveLength(4);
    expect(PHULERA_ADVANTAGES).toHaveLength(6);
    expect(TOWNSHIP_FEATURES).toHaveLength(3);
    expect(LEAD_CAPTURE_PERKS).toHaveLength(3);
  });
});

describe('PhuleraHeroSection', () => {
  it('renders English headline, badge, and CTA buttons', () => {
    render(<PhuleraHeroSection isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Plots for Sale in Phulera — DMIC Smart City Corridors/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('DMIC Mega Logistics & Western DFC Corridor')).toBeInTheDocument();
    expect(screen.getByText('Explore Flagship Township')).toBeInTheDocument();
    expect(screen.getByText('Get WhatsApp Brochure')).toBeInTheDocument();
    expect(screen.getByText('+91-73000-07643')).toBeInTheDocument();
    expect(screen.getByText('DFC Western Rail Hub')).toBeInTheDocument();
  });

  it('renders Hindi headline, badge, and CTA buttons', () => {
    render(<PhuleraHeroSection isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /फुलेरा में प्लॉट्स — DMIC स्मार्ट सिटी कॉरिडोर/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('DMIC मेगा लॉजिस्टिक्स एवं DFC फ्रेट हब')).toBeInTheDocument();
    expect(screen.getByText('फ्लैगशिप टाउनशिप देखें')).toBeInTheDocument();
    expect(screen.getByText('व्हाट्सएप ब्रोशर प्राप्त करें')).toBeInTheDocument();
    expect(screen.getByText('DFC वेस्टर्न रेल हब')).toBeInTheDocument();
  });
});

describe('PhuleraAdvantageSection', () => {
  it('renders English cards and section header', () => {
    render(<PhuleraAdvantageSection isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /The Phulera Mega Hub Advantage/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Industrial & Commercial Drivers')).toBeInTheDocument();
    expect(screen.getByText('Industrial Warehousing & Container Depots')).toBeInTheDocument();
    expect(screen.getByText('Triple Rail Connectivity & NWR Hub')).toBeInTheDocument();
  });

  it('renders Hindi cards and section header', () => {
    render(<PhuleraAdvantageSection isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /फुलेरा मेगा हब का रणनीतिक महत्व/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('औद्योगिक विकास एवं निवेश के लाभ')).toBeInTheDocument();
    expect(screen.getByText('औद्योगिक वेयरहाउसिंग व कंटेनर डिपो')).toBeInTheDocument();
  });
});

describe('PhuleraTownshipSpotlight', () => {
  it('renders township spotlight with English details and badges', () => {
    render(<PhuleraTownshipSpotlight isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Phulera Corridor & Flagship Developments/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Shivani Vatika 11th \(Harsholi\)/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Ongoing Development')).toBeInTheDocument();
    expect(screen.getByText('~34 km from Phulera')).toBeInTheDocument();
    expect(screen.getByText('View Project Details')).toBeInTheDocument();
    expect(screen.getByText('Phulera Area Guide')).toBeInTheDocument();
  });

  it('renders township spotlight with Hindi details and badges', () => {
    render(<PhuleraTownshipSpotlight isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /फुलेरा कॉरिडोर एवं शिवानी वाटिका 11th/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('चालू विकास (Ongoing)')).toBeInTheDocument();
    expect(screen.getByText('~34 किमी फुलेरा से')).toBeInTheDocument();
    expect(screen.getByText('टाउनशिप देखें')).toBeInTheDocument();
    expect(screen.getByText('फुलेरा एरिया गाइड')).toBeInTheDocument();
  });
});

describe('PhuleraCommuteTable', () => {
  it('renders English commute table headers and landmarks', () => {
    render(<PhuleraCommuteTable isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Distance & Commute Time from Phulera/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Destination / Landmark')).toBeInTheDocument();
    expect(screen.getByText('Drive Time')).toBeInTheDocument();
    expect(screen.getByText('Phulera Junction (NWR & DFC Hub)')).toBeInTheDocument();
    expect(screen.getByText('Sambhar Salt Lake & Eco-Tourism')).toBeInTheDocument();
  });

  it('renders Hindi commute table headers and landmarks', () => {
    render(<PhuleraCommuteTable isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /फुलेरा जंक्शन से प्रमुख केंद्रों की दूरी/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('गंतव्य / लैंडमार्क')).toBeInTheDocument();
    expect(screen.getByText('समय')).toBeInTheDocument();
    expect(screen.getByText('फुलेरा जंक्शन (उत्तर पश्चिम रेलवे व DFC हब)')).toBeInTheDocument();
  });
});

describe('PhuleraFaqSection', () => {
  it('renders English FAQs', () => {
    render(<PhuleraFaqSection isHindi={false} faqItems={PHULERA_FAQS_EN} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Questions About Buying Land in Phulera/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Why are plots for sale in Phulera considered a high-growth real estate investment?'
      )
    ).toBeInTheDocument();
  });

  it('renders Hindi FAQs', () => {
    render(<PhuleraFaqSection isHindi={true} faqItems={PHULERA_FAQS_HI} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /फुलेरा में ज़मीन खरीदने से जुड़े महत्वपूर्ण सवाल/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('सामान्य प्रश्न एवं उत्तर')).toBeInTheDocument();
    expect(
      screen.getByText('फुलेरा में प्लॉट्स खरीदना भविष्य के लिए सबसे बेहतरीन निवेश क्यों है?')
    ).toBeInTheDocument();
  });
});

describe('PhuleraLeadCaptureSection', () => {
  it('renders English brochure lead capture section', () => {
    render(<PhuleraLeadCaptureSection isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Get Phulera Corridor Brochure on WhatsApp/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Book Site Visit or Callback/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Download Brochure on WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Verified legal papers & zero spam guarantee')).toBeInTheDocument();
  });

  it('renders Hindi brochure lead capture section', () => {
    render(<PhuleraLeadCaptureSection isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /फुलेरा स्मार्ट सिटी ब्रोशर व्हाट्सएप पर पाएं/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /साइट विजिट व रेट लिस्ट इंक्वायरी/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('व्हाट्सएप पर ब्रोशर प्राप्त करें')).toBeInTheDocument();
    expect(screen.getByText('100% सत्यापित दस्तावेज एवं जीरो स्पैम गारंटी')).toBeInTheDocument();
  });
});
