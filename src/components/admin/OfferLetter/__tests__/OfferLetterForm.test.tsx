/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { OfferLetterForm } from '../OfferLetterForm';

describe('OfferLetterForm duplicate prevention & edit mode', () => {
  const defaultProps = {
    formData: {
      date: '2026-08-31',
      name: 'Kajal',
      address: 'Noida',
      mobileNo: '9319931646',
      alternativeNo: '',
      emailId: 'kajal@example.com',
      designation: 'BDM',
      department: 'Sales',
      reportingTo: 'Director',
      appointmentDate: '2026-09-01',
      location: 'Noida',
      salaryCtc: '22000',
      salaryType: 'CTC',
      target: '200',
      offerSlab: '3',
      workingHoursStart: '10:30 am',
      workingHoursEnd: '6:30 pm',
      workingDays: 'Wednesday to Monday',
      probationPeriod: '3',
      salesCompensationType: '',
      noSaleMonths: '',
      customSalaryPercent: '',
      subsistenceAllowance: '',
      meetingsPerMonth: '15',
    },
    setFormData: vi.fn(),
    savedOffers: [],
    selectedRecordId: '',
    documentId: null,
    duplicateCandidate: null,
    loadDuplicateRecord: vi.fn(),
    handleResetForm: vi.fn(),
    isGenerating: false,
    showSalesOptions: true,
    setShowSalesOptions: vi.fn(),
    showSlabs: false,
    setShowSlabs: vi.fn(),
    salesCustomDesignation: '',
    setSalesCustomDesignation: vi.fn(),
    showCustomDesignation: false,
    setShowCustomDesignation: vi.fn(),
    handleLoadOffer: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
    handleSalaryChange: vi.fn(),
    handleTargetChange: vi.fn(),
    handleSalarySelect: vi.fn(),
    handleTargetSelect: vi.fn(),
    handleChange: vi.fn(),
  };

  it('renders standard Create Mode button when not editing', () => {
    render(<OfferLetterForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Generate Offer Letter/i })).toBeInTheDocument();
    expect(screen.queryByText(/Edit Mode/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Updating Existing Offer Letter/i)).not.toBeInTheDocument();
  });

  it('renders Edit Mode badge, banner and update button when documentId is provided', () => {
    render(<OfferLetterForm {...defaultProps} documentId="doc-123" />);

    expect(screen.getByText('Edit Mode')).toBeInTheDocument();
    expect(screen.getByText(/Updating Existing Offer Letter/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Update & Download Offer Letter/i })
    ).toBeInTheDocument();
  });

  it('calls handleResetForm when New Letter button is clicked in Edit Mode', () => {
    render(<OfferLetterForm {...defaultProps} documentId="doc-123" />);

    const newBtn = screen.getByRole('button', { name: /New Letter/i });
    fireEvent.click(newBtn);

    expect(defaultProps.handleResetForm).toHaveBeenCalled();
  });

  it('renders duplicate candidate warning banner when duplicateCandidate exists and not in edit mode', () => {
    const mockDuplicate = {
      id: 'doc-existing-999',
      created_at: '2026-08-31T07:35:00.000Z',
      form_data: {
        name: 'Kajal Sharma',
        mobileNo: '9319931646',
      },
    };

    render(<OfferLetterForm {...defaultProps} duplicateCandidate={mockDuplicate} />);

    expect(screen.getByText(/Potential Duplicate Candidate Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Kajal Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/9319931646/i)).toBeInTheDocument();

    const loadBtn = screen.getByRole('button', { name: /Load & Update Existing Record/i });
    fireEvent.click(loadBtn);

    expect(defaultProps.loadDuplicateRecord).toHaveBeenCalled();
  });
});
