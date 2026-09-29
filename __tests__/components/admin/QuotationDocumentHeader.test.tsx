import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuotationDocumentHeader } from '@/src/components/admin/quotation/preview/QuotationDocumentHeader';

describe('QuotationDocumentHeader', () => {
  it('renders company information correctly', () => {
    const info = {
      company_name: 'SVI Infra Solutions Pvt. Ltd.',
      company_address: 'Sector 63, Noida',
      company_phone: '+91 9216014579',
      company_email: 'info@sviinfrasolutions.com',
      company_website: 'www.sviinfrasolutions.com',
    };

    render(<QuotationDocumentHeader companyInfo={info} />);

    expect(screen.getByText('SVI Infra Solutions Pvt. Ltd.')).toBeInTheDocument();
    expect(screen.getByText('Sector 63, Noida')).toBeInTheDocument();
    expect(screen.getByText('+91 9216014579')).toBeInTheDocument();
    expect(screen.getByText('info@sviinfrasolutions.com')).toBeInTheDocument();
    expect(screen.getByText('www.sviinfrasolutions.com')).toBeInTheDocument();
  });
});
