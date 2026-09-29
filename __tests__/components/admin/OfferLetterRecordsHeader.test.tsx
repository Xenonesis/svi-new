import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferLetterRecordsHeader } from '@/src/components/admin/offer-letter-records/OfferLetterRecordsHeader';

describe('OfferLetterRecordsHeader', () => {
  it('renders heading and subtitle correctly', () => {
    render(<OfferLetterRecordsHeader loading={false} onRefresh={() => {}} />);

    expect(screen.getByText('Offer Letter')).toBeInTheDocument();
    expect(screen.getByText('Records')).toBeInTheDocument();
    expect(
      screen.getByText(/View, search, audit, download, and delete all generated offer letters/i)
    ).toBeInTheDocument();
  });
});
