import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  AllotmentLetterPreview,
  DEFAULT_CORPORATE_ADDRESS,
  type AllotmentLetterFormData,
  type CompanyInfo,
} from '@/src/components/admin/DocumentGenerator/AllotmentLetterPreview';

describe('AllotmentLetterPreview Luxury A4 Standard', () => {
  const baseCompanyInfo: CompanyInfo = {
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'Custom Office Tower, Sector 62, Noida, UP',
    company_phone: '+91 98765 43210',
    company_email: 'care@sviinfrasolutions.com',
    company_website: 'www.sviinfrasolutions.com',
    bank_account_name: 'SVI INFRA SOLUTIONS PVT LTD',
    bank_account_no: '0894102000013837',
    bank_name: 'IDBI BANK',
    bank_ifsc: 'IBKL0000894',
  };

  const baseFormData: AllotmentLetterFormData = {
    clientName: 'Rahul Sharma',
    salutation: 'Mr.',
    address: 'Flat 402, Royal Palms, New Delhi 110025',
    mobileNo: '+91 91234 56789',
    projectName: 'Yamuna Express City',
    plotNo: 'YEC-Plot-104',
    ticketId: 'TCK-2026-9081',
    area: '100',
    bsp: '5000',
    plc: '10',
    edc: '25000',
    bookingPaymentPercent: '10',
    showSecondInstalment: true,
    secondPaymentDays: '15',
    paymentPlan: '12',
    emiCount: '12',
    bookingDate: '2026-05-10',
    emiStartDate: '2026-06-10',
    advisorName: 'Amit Verma',
    advisorNumber: '+91 98111 22233',
    advisorEmail: 'amit.verma@sviinfra.com',
  };

  it('renders strongly typed allotment letter with luxury A4 container styling', () => {
    const { container } = render(
      <AllotmentLetterPreview
        id="test-allotment-preview"
        formData={baseFormData}
        companyInfo={baseCompanyInfo}
      />
    );

    const rootElement = container.firstElementChild as HTMLElement;
    expect(rootElement).toHaveAttribute('id', 'test-allotment-preview');
    expect(rootElement.className).toContain('min-h-[297mm]');
    expect(rootElement.className).toContain('max-w-[210mm]');
    expect(rootElement.className).toContain('bg-white');
    expect(rootElement.className).toContain('shadow-2xl');
    expect(rootElement.className).toContain('text-slate-900');
  });

  it('renders official corporate header with company info and fallback address', () => {
    // When company_address is empty or whitespace
    const emptyAddressCompany: CompanyInfo = {
      ...baseCompanyInfo,
      company_address: '',
    };

    const { rerender } = render(
      <AllotmentLetterPreview formData={baseFormData} companyInfo={emptyAddressCompany} />
    );

    // Should fall back to DEFAULT_CORPORATE_ADDRESS
    expect(screen.getByText(new RegExp(DEFAULT_CORPORATE_ADDRESS, 'i'))).toBeInTheDocument();
    expect(
      screen.getByText('Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309', {
        exact: false,
      })
    ).toBeInTheDocument();

    // Rerender with custom address
    rerender(<AllotmentLetterPreview formData={baseFormData} companyInfo={baseCompanyInfo} />);
    expect(screen.getByText(/Custom Office Tower, Sector 62, Noida, UP/i)).toBeInTheDocument();
  });

  it('renders official branding logo in header and subtle security watermark', () => {
    render(<AllotmentLetterPreview formData={baseFormData} companyInfo={baseCompanyInfo} />);

    const images = screen.getAllByRole('img');
    const headerLogo = images.find(
      (img) =>
        img.getAttribute('src') === '/logo.png' &&
        img.getAttribute('alt') === baseCompanyInfo.company_name
    );
    expect(headerLogo).toBeDefined();

    const watermark = images.find(
      (img) => img.getAttribute('src') === '/logo.png' && img.getAttribute('alt') === 'Watermark'
    );
    expect(watermark).toBeDefined();
    expect(watermark?.className).toContain('opacity-[0.04]');
  });

  it('renders client information, plot allocation, and salutation correctly', () => {
    render(<AllotmentLetterPreview formData={baseFormData} companyInfo={baseCompanyInfo} />);

    expect(screen.getAllByText(/Rahul Sharma/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Dear Mr\./i)).toBeInTheDocument();
    expect(screen.getByText(/Flat 402, Royal Palms, New Delhi 110025/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile: \+91 91234 56789/i)).toBeInTheDocument();
    expect(screen.getByText(/TCK-2026-9081/i)).toBeInTheDocument();
    expect(screen.getAllByText(/YEC-Plot-104/i).length).toBeGreaterThan(0);
  });

  it('calculates total cost correctly (area * bsp + plc + edc)', () => {
    // base = 100 * 5000 = 500,000
    // plc = 10% of base = 50,000
    // edc = 25,000
    // total = 575,000.00
    render(<AllotmentLetterPreview formData={baseFormData} companyInfo={baseCompanyInfo} />);

    expect(screen.getByText('575000.00')).toBeInTheDocument();
    // Booking amount 10% of 575000 = Rs. 57500.00 (appears in table and terms)
    expect(screen.getAllByText(/Rs\. 57500\.00/i).length).toBeGreaterThan(0);
    // Second instalment 20% of 575000 = Rs. 115000.00 (appears in table and terms)
    expect(screen.getAllByText(/Rs\. 115000\.00/i).length).toBeGreaterThan(0);
  });

  it('calculates one-time payment plan correctly when planType is one_time', () => {
    const oneTimeFormData: AllotmentLetterFormData = {
      ...baseFormData,
      planType: 'one_time',
      bookingPaymentPercent: '25',
      remainingDueDate: '2026-06-30',
    };

    render(<AllotmentLetterPreview formData={oneTimeFormData} companyInfo={baseCompanyInfo} />);

    // Total = 575,000
    expect(screen.getAllByText(/One-Time Payment Plan/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Booking Advance/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Rs\. 143750\.00/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rs\. 431250\.00/i).length).toBeGreaterThan(0);
  });

  it('renders official signature block with seal space and authorized signatory', () => {
    render(<AllotmentLetterPreview formData={baseFormData} companyInfo={baseCompanyInfo} />);

    expect(screen.getByTestId('seal-space')).toBeInTheDocument();
    expect(screen.getByText('Official Seal')).toBeInTheDocument();
    expect(screen.getByText('Authorized Signatory')).toBeInTheDocument();
    expect(screen.getByAltText('Authorized Signatory')).toHaveAttribute('src', '/signature.png');
  });

  it('renders bank details and account manager contact information', () => {
    render(<AllotmentLetterPreview formData={baseFormData} companyInfo={baseCompanyInfo} />);

    expect(screen.getByText(/0894102000013837/i)).toBeInTheDocument();
    expect(screen.getByText(/IDBI BANK/i)).toBeInTheDocument();
    expect(screen.getByText(/IBKL0000894/i)).toBeInTheDocument();
    expect(screen.getByText(/Amit Verma/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 98111 22233/i)).toBeInTheDocument();
  });
});
