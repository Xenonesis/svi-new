import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import {
  KHATU_PAGE_KEYWORDS,
  KHATU_PAGE_META,
  KHATU_CONTACT,
  KHATU_FAQS_EN,
  KHATU_FAQS_HI,
  TRANSIT_MATRIX,
  STRATEGIC_GROWTH_CARDS,
  TOWNSHIP_SPECS,
  TOWNSHIP_AMENITIES,
  DUE_DILIGENCE_STEPS,
} from '@/src/components/plots/khatu-shyam/khatuData';
import { KhatuHeroSection } from '@/src/components/plots/khatu-shyam/KhatuHeroSection';
import { KhatuStrategicGrowthSection } from '@/src/components/plots/khatu-shyam/KhatuStrategicGrowthSection';
import { KhatuTownshipSpotlight } from '@/src/components/plots/khatu-shyam/KhatuTownshipSpotlight';
import { KhatuTransitMatrixSection } from '@/src/components/plots/khatu-shyam/KhatuTransitMatrixSection';
import { KhatuDueDiligenceSection } from '@/src/components/plots/khatu-shyam/KhatuDueDiligenceSection';
import { KhatuFaqAccordion } from '@/src/components/plots/khatu-shyam/KhatuFaqAccordion';
import { KhatuCtaBanner } from '@/src/components/plots/khatu-shyam/KhatuCtaBanner';

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

describe('Khatu Shyam Data Module (khatuData)', () => {
  it('provides complete keywords and metadata structures', () => {
    expect(KHATU_PAGE_KEYWORDS.length).toBeGreaterThan(20);
    expect(KHATU_PAGE_META.titleEn).toContain('Plots for Sale Near Khatu Shyam Ji');
    expect(KHATU_PAGE_META.titleHi).toContain('खाटू श्याम जी');
    expect(KHATU_CONTACT.phone).toBe('+917300007643');
    expect(KHATU_CONTACT.gateImage).toBe('/Shivani Vatika 11/gate.webp');
  });

  it('contains matched English and Hindi FAQ lists of 7 items each', () => {
    expect(KHATU_FAQS_EN).toHaveLength(7);
    expect(KHATU_FAQS_HI).toHaveLength(7);
    KHATU_FAQS_EN.forEach((faq) => {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    });
  });

  it('contains 6 transit nodes, 4 growth cards, 4 due diligence steps', () => {
    expect(TRANSIT_MATRIX).toHaveLength(6);
    expect(STRATEGIC_GROWTH_CARDS).toHaveLength(4);
    expect(DUE_DILIGENCE_STEPS).toHaveLength(4);
    expect(TOWNSHIP_SPECS).toHaveLength(4);
    expect(TOWNSHIP_AMENITIES).toHaveLength(4);
  });
});

describe('KhatuHeroSection', () => {
  it('renders English headline and CTA buttons', () => {
    render(<KhatuHeroSection isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Residential Plots for Sale Near Khatu Shyam Ji Highway/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Spiritual & High-Growth Commercial Corridor')).toBeInTheDocument();
    expect(screen.getByText('Explore Shivani Vatika 11th')).toBeInTheDocument();
    expect(screen.getByText('Download Brochure PDF')).toBeInTheDocument();
  });

  it('renders Hindi headline and CTA buttons', () => {
    render(<KhatuHeroSection isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /खाटू श्याम जी हाईवे पर आवासीय प्लॉट्स की बिक्री/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('श्री खाटू श्याम जी तीर्थ एवं औद्योगिक विकास कॉरिडोर')
    ).toBeInTheDocument();
    expect(screen.getByText('शिवानी वाटिका 11th विवरण देखें')).toBeInTheDocument();
  });
});

describe('KhatuStrategicGrowthSection', () => {
  it('renders English cards and section header', () => {
    render(<KhatuStrategicGrowthSection isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Why Invest in Plots on Jaipur–Khatu Shyam Ji Highway/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Strategic Growth Engines')).toBeInTheDocument();
    expect(screen.getByText('4.5+ Crore Devotees')).toBeInTheDocument();
    expect(screen.getByText('4-Lane Highway Expansion')).toBeInTheDocument();
  });

  it('renders Hindi cards and section header', () => {
    render(<KhatuStrategicGrowthSection isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /खाटू श्याम जी हाईवे कॉरिडोर में निवेश क्यों करें/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('रणनीतिक विकास कॉरिडोर')).toBeInTheDocument();
    expect(screen.getByText('4.5+ करोड़ तीर्थयात्री')).toBeInTheDocument();
  });
});

describe('KhatuTownshipSpotlight', () => {
  it('renders township spotlight with English specs and badges', () => {
    render(<KhatuTownshipSpotlight isHindi={false} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Shivani Vatika 11th \(Harsholi\)/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Ongoing Development')).toBeInTheDocument();
    expect(screen.getByText('From ₹ 15 Lakhs*')).toBeInTheDocument();
    expect(screen.getByText('View Master Plan & Layout')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp Inquiry')).toBeInTheDocument();
  });

  it('renders township spotlight with Hindi specs and badges', () => {
    render(<KhatuTownshipSpotlight isHindi={true} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /शिवानी वाटिका 11th \(हरसोली - खाटू हाईवे\)/i })
    ).toBeInTheDocument();
    expect(screen.getByText('चालू विकास (Ongoing)')).toBeInTheDocument();
    expect(screen.getByText('प्रारंभिक ₹ 15 लाख*')).toBeInTheDocument();
    expect(screen.getByText('टाउनशिप लेआउट देखें')).toBeInTheDocument();
  });
});

describe('KhatuTransitMatrixSection', () => {
  it('renders English transit matrix items', () => {
    render(<KhatuTransitMatrixSection isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Distance & Travel Time from Shivani Vatika 11th/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Shree Khatu Shyam Ji Mandir')).toBeInTheDocument();
    expect(screen.getByText('RIICO Industrial Area (Renwal)')).toBeInTheDocument();
    expect(screen.getByText('20–25 Mins')).toBeInTheDocument();
  });

  it('renders Hindi transit matrix items', () => {
    render(<KhatuTransitMatrixSection isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /शिवानी वाटिका 11th से प्रमुख स्थलों की दूरी/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('श्री खाटू श्याम जी मंदिर')).toBeInTheDocument();
    expect(screen.getByText('रीको इंडस्ट्रियल एरिया (रेणवाल)')).toBeInTheDocument();
  });
});

describe('KhatuDueDiligenceSection', () => {
  it('renders 4 due diligence steps in English', () => {
    render(<KhatuDueDiligenceSection isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Due Diligence & Legal Approvals Verification/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Section 90-A Conversion')).toBeInTheDocument();
    expect(screen.getByText('Verified Jamabandi Record')).toBeInTheDocument();
    expect(screen.getByText('Mutation (Namantaran)')).toBeInTheDocument();
    expect(screen.getByText('Sub-Registrar Registry')).toBeInTheDocument();
  });

  it('renders 4 due diligence steps in Hindi', () => {
    render(<KhatuDueDiligenceSection isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /कानूनी सत्यापन, 90-A रूपांतरण व रजिस्ट्री प्रक्रिया/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('धारा 90-A रूपांतरण')).toBeInTheDocument();
    expect(screen.getByText('स्वच्छ जमाबंदी नकल')).toBeInTheDocument();
  });
});

describe('KhatuFaqAccordion', () => {
  it('renders all default English FAQs', () => {
    render(<KhatuFaqAccordion isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Frequently Asked Questions About Plots Near Khatu Shyam Ji/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('How far are these residential plots from Shree Khatu Shyam Ji Temple?')
    ).toBeInTheDocument();
  });

  it('renders default Hindi FAQs', () => {
    render(<KhatuFaqAccordion isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /खाटू श्याम जी के पास प्लॉट्स से जुड़े महत्वपूर्ण सवाल/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('खाटू श्याम जी मंदिर से ये आवासीय प्लॉट्स कितनी दूरी पर हैं?')
    ).toBeInTheDocument();
  });

  it('renders custom FAQs when provided via faqs prop', () => {
    const customFaqs = [
      { question: 'Custom Question 1?', answer: 'Custom Answer 1.' },
      { question: 'Custom Question 2?', answer: 'Custom Answer 2.' },
    ];
    render(<KhatuFaqAccordion isHindi={false} faqs={customFaqs} />);
    expect(screen.getByText('Custom Question 1?')).toBeInTheDocument();
    expect(screen.getByText('Custom Answer 1.')).toBeInTheDocument();
    expect(screen.getByText('Custom Question 2?')).toBeInTheDocument();
  });
});

describe('KhatuCtaBanner', () => {
  it('renders English CTA banner with cab booking link', () => {
    render(<KhatuCtaBanner isHindi={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Experience the Khatu Shyam Highway Corridor Firsthand/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Zero Cost Doorstep Inspection')).toBeInTheDocument();
    expect(screen.getByText('Book Free Site Visit Cab')).toBeInTheDocument();
    expect(screen.getByText('Download Master Plan PDF')).toBeInTheDocument();
  });

  it('renders Hindi CTA banner', () => {
    render(<KhatuCtaBanner isHindi={true} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /खाटू श्याम जी हाईवे कॉरिडोर का प्रत्यक्ष अनुभव लें/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('निःशुल्क एसी कैब सुविधा')).toBeInTheDocument();
    expect(screen.getByText('फ्री कैब साइट विजिट बुक करें')).toBeInTheDocument();
  });
});
