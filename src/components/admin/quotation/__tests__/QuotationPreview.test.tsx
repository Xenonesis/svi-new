import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuotationPreview from '../QuotationPreview';
import type {
  QuotationCalculationResult,
  QuotationFormData,
  PricingTierCalculation,
  CompanyInfo,
} from '@/src/lib/quotation/types';

const mockCompanyInfo: CompanyInfo = {
  company_name: 'SVI Infra Solutions Pvt. Ltd.',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, UP 201309',
  company_phone: '+91 9216014579',
  company_email: 'info@sviinfrasolutions.com',
  company_website: 'https://www.sviinfrasolutions.com',
  bank_account_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
  bank_name: 'IDBI Bank Ltd.',
  bank_account_no: '0894102000013837',
  bank_ifsc: 'IBKL0000894',
};

const mockFormData: QuotationFormData = {
  quotationNo: 'SVI-QTN-20261021-0001',
  quotationDate: '2026-10-21',
  validUntil: '2026-11-20',
  customerName: 'Aarav Sharma',
  customerPhone: '+91 9876543210',
  customerEmail: 'aarav.sharma@example.com',
  customerAddress: 'Flat 402, Block C, Noida, UP',
  projectName: 'Shivani Vatika 11',
  plotNo: 'Plot 42',
  propertyType: 'Residential Plot',
  area: '120',
  basicRate: '8500',
  edcRate: '150',
  plcPercent: '5',
  notes: 'Corner plot with park facing view. Immediate registry available.',
  paymentMonths: '12',
};

const mockCalculation: QuotationCalculationResult = {
  area: 120,
  basicRate: 8500,
  basicPrice: 1020000,
  edcRate: 150,
  edcAmount: 18000,
  plcPercent: 5,
  plcAmount: 51000,
  grandTotal: 1089000,
  effectiveRate: 9075,
};

describe('QuotationPreview Component', () => {
  it('renders official brand header, company details and document metadata', () => {
    render(
      <QuotationPreview
        formData={mockFormData}
        calculation={mockCalculation}
        companyInfo={mockCompanyInfo}
      />
    );
    const companyHeaders = screen.getAllByText('SVI INFRA SOLUTIONS PVT. LTD.');
    expect(companyHeaders.length).toBeGreaterThan(0);
    expect(screen.getByText('PROPERTY QUOTATION')).toBeInTheDocument();
    expect(screen.getByText('SVI-QTN-20261021-0001')).toBeInTheDocument();
    expect(screen.getByText(mockCompanyInfo.company_address)).toBeInTheDocument();
  });

  it('renders customer dossier and property specification cards', () => {
    render(
      <QuotationPreview
        formData={mockFormData}
        calculation={mockCalculation}
        companyInfo={mockCompanyInfo}
      />
    );

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
    expect(screen.getByText('aarav.sharma@example.com')).toBeInTheDocument();
    expect(screen.getByText('Shivani Vatika 11')).toBeInTheDocument();
    expect(screen.getByText('Plot 42')).toBeInTheDocument();
    expect(screen.getAllByText(/120 Sq\. Yds\./).length).toBeGreaterThan(0);
  });

  it('renders single-tier price breakdown, milestones, and No-Cost EMI schedule', () => {
    render(
      <QuotationPreview
        formData={mockFormData}
        calculation={mockCalculation}
        companyInfo={mockCompanyInfo}
      />
    );

    expect(screen.getByText(/Price Breakdown & Calculation/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Milestones & Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 1: 10% Draw Token/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 2: 20% Confirmation/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 3: 70% Remaining/i)).toBeInTheDocument();
  });

  it('renders multi-tier comparative table when tierCalculations has multiple entries', () => {
    const mockTiers: PricingTierCalculation[] = [
      {
        id: 'tier-1',
        label: 'Full Payment (One-Time)',
        basicRate: 8000,
        paymentMonths: '1',
        area: 120,
        basicPrice: 960000,
        edcRate: 150,
        edcAmount: 18000,
        plcPercent: 5,
        plcAmount: 48000,
        grandTotal: 1026000,
        effectiveRate: 8550,
      },
      {
        id: 'tier-2',
        label: '12-Month EMI Plan',
        basicRate: 8500,
        paymentMonths: '12',
        area: 120,
        basicPrice: 1020000,
        edcRate: 150,
        edcAmount: 18000,
        plcPercent: 5,
        plcAmount: 51000,
        grandTotal: 1089000,
        effectiveRate: 9075,
      },
    ];

    render(
      <QuotationPreview
        formData={mockFormData}
        calculation={mockCalculation}
        tierCalculations={mockTiers}
        companyInfo={mockCompanyInfo}
      />
    );
    expect(screen.getByText(/Comparative Payment Options/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Full Payment \(One-Time\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/12-Month EMI Plan/i).length).toBeGreaterThan(0);
  });

  it('renders official bank details, amenities, custom remarks, and authorized signatory', () => {
    render(
      <QuotationPreview
        formData={mockFormData}
        calculation={mockCalculation}
        companyInfo={mockCompanyInfo}
      />
    );

    expect(screen.getByText(/Official Bank Account for Booking/i)).toBeInTheDocument();
    expect(screen.getByText('0894102000013837')).toBeInTheDocument();
    expect(screen.getByText('IBKL0000894')).toBeInTheDocument();
    expect(screen.getByText(/Gated & Secured Society/i)).toBeInTheDocument();
    expect(screen.getByText(/Corner plot with park facing view/i)).toBeInTheDocument();
    expect(screen.getByText('Authorized Signatory')).toBeInTheDocument();
  });
});
