import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BbaPreviewContent, {
  type BbaFormData,
} from '@/src/components/admin/DocumentGenerator/BbaPreviewContent';
import BbaPreviewContentHindi from '@/src/components/admin/DocumentGenerator/BbaPreviewContentHindi';
import {
  type CompanyInfo,
  DEFAULT_CORPORATE_ADDRESS,
} from '@/src/components/admin/DocumentGenerator/AllotmentLetterPreview';

describe('BbaPreviewContent Standard & Unified Corporate Branding', () => {
  const baseCompanyInfo: CompanyInfo = {
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'Custom Corporate Towers, Sector 62, Noida, Uttar Pradesh',
    company_phone: '+91 9216014579',
    company_email: 'info@sviinfrasolutions.com',
    company_website: 'www.sviinfrasolutions.com',
    bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
    bank_account_no: '0894102000013837',
    bank_name: 'IDBI BANK',
    bank_ifsc: 'IBKL0000894',
  };

  const emptyAddressCompany: CompanyInfo = {
    ...baseCompanyInfo,
    company_address: '',
  };

  const baseFormData: BbaFormData = {
    salutation: 'Mr.',
    clientName: 'Vikram Malhotra',
    ticketId: 'SVI-BBA-1001',
    projectName: 'Shyam Aangan',
    unitNumber: 'Plot-88',
    area: '150',
    bsp: '2500',
    plc: '10',
    edc: '50000',
    paymentPlan: '12',
    bookingDate: '2026-03-15',
    secondPaymentDays: '15',
    advisorName: 'Amit Saxena',
    advisorNumber: '+91 9876543210',
    advisorEmail: 'amit.saxena@sviinfrasolutions.com',
    bookingPaymentPercent: '10',
    addressLine1: 'Villa 12, Green Meadows',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
  };
  it('renders strictly typed BbaPreviewContent with custom corporate address', () => {
    render(<BbaPreviewContent formData={baseFormData} companyInfo={baseCompanyInfo} />);

    expect(screen.getAllByText(/Vikram Malhotra/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Custom Corporate Towers, Sector 62, Noida, Uttar Pradesh/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Plot-88/i).length).toBeGreaterThan(0);
  });

  it('falls back to standard corporate address when company_address is empty in English preview', () => {
    render(<BbaPreviewContent formData={baseFormData} companyInfo={emptyAddressCompany} />);

    expect(screen.getAllByText(new RegExp(DEFAULT_CORPORATE_ADDRESS, 'i')).length).toBeGreaterThan(
      0
    );
  });

  it('renders strictly typed BbaPreviewContentHindi with standard corporate address fallback', () => {
    render(<BbaPreviewContentHindi formData={baseFormData} companyInfo={emptyAddressCompany} />);

    expect(screen.getAllByText(new RegExp(DEFAULT_CORPORATE_ADDRESS, 'i')).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText(/Vikram Malhotra/i).length).toBeGreaterThan(0);
  });
});
