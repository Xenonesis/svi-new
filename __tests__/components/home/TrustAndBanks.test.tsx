import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TrustAndBanks from '@/src/components/home/TrustAndBanks';
import TrustMetricsGrid from '@/src/components/home/TrustMetricsGrid';
import BankApprovalsGrid from '@/src/components/home/BankApprovalsGrid';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

describe('TrustAndBanks Server Component Suite', () => {
  it('renders TrustMetricsGrid with all trust metrics correctly', () => {
    render(<TrustMetricsGrid />);
    expect(screen.getByText('Verified Land Titles')).toBeDefined();
    expect(screen.getByText('Transparent Pricing')).toBeDefined();
    expect(screen.getByText('Ready For Possession')).toBeDefined();
    expect(screen.getByText('17+ Years Legacy')).toBeDefined();
  });

  it('renders BankApprovalsGrid with direct developer payment plans', () => {
    render(<BankApprovalsGrid />);
    expect(screen.getByText('DIRECT DEVELOPER PAYMENT PLANS')).toBeDefined();
    expect(
      screen.getByText('Flexible Installments & Direct Developer Payment Terms')
    ).toBeDefined();
    expect(screen.getByText('Minimal Token Booking')).toBeDefined();
  });

  it('renders TrustAndBanks container incorporating both grids', () => {
    render(<TrustAndBanks />);
    expect(screen.getByText('Verified Land Titles')).toBeDefined();
    expect(screen.getByText('DIRECT DEVELOPER PAYMENT PLANS')).toBeDefined();
  });
});
