import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PlotsUnder20LakhsHero,
  PlotsUnder20LakhsFeatured,
  PlotsUnder20LakhsFaq,
  BUDGET_FAQS,
  VALUE_HIGHLIGHTS,
} from '@/src/components/plots/under-20-lakhs';

describe('PlotsUnder20Lakhs Components', () => {
  it('renders PlotsUnder20LakhsHero in English and Hindi', () => {
    const { rerender } = render(<PlotsUnder20LakhsHero isHindi={false} />);
    expect(screen.getByText(/Residential Plots in Jaipur Under ₹ 20 Lakhs/i)).toBeInTheDocument();
    expect(screen.getByText(/Budget-Friendly Plotted Townships/i)).toBeInTheDocument();

    rerender(<PlotsUnder20LakhsHero isHindi={true} />);
    expect(screen.getByText(/जयपुर में 20 लाख के अंदर रेजिडेंशियल प्लॉट्स/i)).toBeInTheDocument();
    expect(screen.getByText(/बजट-फ्रेंडली सुरक्षित निवेश/i)).toBeInTheDocument();
  });

  it('renders all value highlights', () => {
    render(<PlotsUnder20LakhsHero isHindi={false} />);
    VALUE_HIGHLIGHTS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(item.sub)).toBeInTheDocument();
    });
  });

  it('renders PlotsUnder20LakhsFeatured project section correctly', () => {
    const { rerender } = render(<PlotsUnder20LakhsFeatured isHindi={false} />);
    expect(screen.getByText('Shivani Vatika 11th')).toBeInTheDocument();
    expect(screen.getByText(/Top Recommended Budget Option/i)).toBeInTheDocument();

    rerender(<PlotsUnder20LakhsFeatured isHindi={true} />);
    expect(screen.getByText(/शीर्ष अनुशंसित बजट विकल्प/i)).toBeInTheDocument();
  });

  it('renders PlotsUnder20LakhsFaq accordion items', () => {
    render(<PlotsUnder20LakhsFaq isHindi={false} />);
    expect(screen.getByText('Budget Plot Buying FAQs')).toBeInTheDocument();
    BUDGET_FAQS.forEach((faq) => {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
    });
  });
});
