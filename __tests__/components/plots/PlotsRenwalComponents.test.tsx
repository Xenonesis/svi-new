import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PlotsRenwalHero,
  PlotsRenwalFeatured,
  PlotsRenwalFaq,
  RENWAL_FAQS,
  RENWAL_CONNECTIVITY_ITEMS,
} from '@/src/components/plots/renwal';

describe('PlotsRenwal Components', () => {
  it('renders PlotsRenwalHero in English and Hindi', () => {
    const { rerender } = render(<PlotsRenwalHero isHindi={false} />);
    expect(screen.getByText(/Plots Near Renwal Railway Station & RIICO Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/8 Mins to Renwal Junction & RIICO/i)).toBeInTheDocument();

    rerender(<PlotsRenwalHero isHindi={true} />);
    expect(
      screen.getByText(/रेनवाल रेलवे स्टेशन के पास प्रीमियम आवासीय प्लॉट्स/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/रेलवे स्टेशन व रीको के समीप/i)).toBeInTheDocument();
  });

  it('renders all connectivity highlights', () => {
    render(<PlotsRenwalHero isHindi={false} />);
    RENWAL_CONNECTIVITY_ITEMS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(item.sub)).toBeInTheDocument();
    });
  });

  it('renders PlotsRenwalFeatured township section correctly', () => {
    const { rerender } = render(<PlotsRenwalFeatured isHindi={false} />);
    expect(screen.getByText('Shivani Vatika 11th (Harsholi)')).toBeInTheDocument();
    expect(screen.getByText(/Flagship Township Near Renwal/i)).toBeInTheDocument();

    rerender(<PlotsRenwalFeatured isHindi={true} />);
    expect(screen.getByText(/रेनवाल के पास प्रमुख टाउनशिप/i)).toBeInTheDocument();
  });

  it('renders PlotsRenwalFaq accordion items', () => {
    render(<PlotsRenwalFaq isHindi={false} />);
    expect(screen.getByText('Renwal Plot Buying FAQs')).toBeInTheDocument();
    RENWAL_FAQS.forEach((faq) => {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
    });
  });
});
