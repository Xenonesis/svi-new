import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Step4ReviewConfirm } from '../steps/Step4ReviewConfirm';
import { INITIAL_FORM_DATA, FormData } from '../types';

// Mock Captcha to isolate Step4 review logic and test callback integration
vi.mock('@/src/components/Captcha', () => ({
  default: ({ onValidate, error }: { onValidate: (answer: string) => void; error?: string }) => (
    <div data-testid="captcha-component">
      <input
        data-testid="captcha-input"
        aria-label="Captcha answer"
        onChange={(e) => onValidate(e.target.value)}
      />
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

const mockT = (key: string): string => {
  const translations: Record<string, string> = {
    sectionPersonal: 'Applicant Personal Details',
    applicantName: 'Full Name',
    mobileNo: 'Mobile Number',
    email: 'Email Address',
    soWoDo: 'Father / Husband / Guardian',
    dob: 'Date of Birth',
    sectionDocuments: 'KYC & Residential Address',
    aadharNumber: 'Aadhaar Card (Masked)',
    panNumber: 'PAN Card Number',
    state: 'State / Union Territory',
    city: 'City / District',
    pincode: 'PIN Code',
    address: 'Permanent Address',
    sectionProperty: 'Property & Scheme Details',
    selectProjects: 'Project',
    propertySize: 'Plot Area / Dimensions',
    paymentPlan: 'Payment Plan',
    paymentMode: 'Payment Mode',
    plotPreference: 'Plot Preference',
    schemeAmount: 'Allotment Token Fee',
    prevStep: 'Back to Property',
    'validation.submitError': 'Submission Error',
  };
  return translations[key] || key;
};

const COMPLETE_FORM_DATA: FormData = {
  ...INITIAL_FORM_DATA,
  firstName: 'RAMESH',
  lastName: 'KUMAR',
  mobileNo: '9876543210',
  email: 'ramesh.kumar@example.com',
  soWoDo: 'S/O SURESH KUMAR',
  dob: '1990-05-15',
  aadharNumber: '1234 5678 9012',
  panNumber: 'ABCDE1234F',
  state: 'UTTAR PRADESH',
  city: 'NOIDA',
  pincode: '201301',
  address: 'PLOT 42, SECTOR 62, NEAR METRO',
  project: 'shivani-vatika',
  propertySize: '100-200',
  propertyType: 'residential-plot',
  plotPreference: 'Park Facing Corner',
  paymentPlan: '3-months',
  paymentMode: 'online',
  schemeAmount: '21000',
};

describe('Step4ReviewConfirm', () => {
  const defaultProps = {
    formData: COMPLETE_FORM_DATA,
    errors: {},
    attempted: false,
    t: mockT,
    onChange: vi.fn(),
    photoFile: null,
    panCardFile: null,
    captchaAnswer: '',
    captchaError: '',
    isSubmitting: false,
    submitError: '',
    onCaptchaValidate: vi.fn(),
    onEditStep: vi.fn(),
    onProceedToPayment: vi.fn(),
    onPrev: vi.fn(),
  };

  it('renders Applicant Details card with all personal fields', () => {
    render(<Step4ReviewConfirm {...defaultProps} />);

    expect(screen.getByText('Applicant Personal Details')).toBeInTheDocument();
    expect(screen.getByText('RAMESH KUMAR')).toBeInTheDocument();
    expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
    expect(screen.getByText('ramesh.kumar@example.com')).toBeInTheDocument();
    expect(screen.getByText('S/O SURESH KUMAR')).toBeInTheDocument();
    expect(screen.getByText('15/05/1990')).toBeInTheDocument();
  });

  it('calls onEditStep(1) when clicking Edit on Applicant Details card', () => {
    const onEditStep = vi.fn();
    render(<Step4ReviewConfirm {...defaultProps} onEditStep={onEditStep} />);

    const editApplicantBtn = screen.getByLabelText(/Edit Applicant Details/i);
    fireEvent.click(editApplicantBtn);

    expect(onEditStep).toHaveBeenCalledWith(1);
  });

  it('renders KYC & Address card with masked Aadhaar and address fields', () => {
    render(<Step4ReviewConfirm {...defaultProps} />);

    expect(screen.getByText('KYC & Residential Address')).toBeInTheDocument();
    expect(screen.getByText('•••• •••• 9012')).toBeInTheDocument();
    expect(screen.getByText('ABCDE1234F')).toBeInTheDocument();
    expect(screen.getByText('UTTAR PRADESH')).toBeInTheDocument();
    expect(screen.getByText('NOIDA')).toBeInTheDocument();
    expect(screen.getByText('201301')).toBeInTheDocument();
    expect(screen.getByText('PLOT 42, SECTOR 62, NEAR METRO')).toBeInTheDocument();
  });

  it('renders uploaded file names when files are provided', () => {
    const photo = new File(['photo-bytes'], 'applicant-photo.jpg', { type: 'image/jpeg' });
    const pan = new File(['pan-bytes'], 'pan-scan.pdf', { type: 'application/pdf' });

    render(<Step4ReviewConfirm {...defaultProps} photoFile={photo} panCardFile={pan} />);

    expect(screen.getByText('applicant-photo.jpg')).toBeInTheDocument();
    expect(screen.getByText('pan-scan.pdf')).toBeInTheDocument();
  });

  it('calls onEditStep(2) when clicking Edit on KYC & Address card', () => {
    const onEditStep = vi.fn();
    render(<Step4ReviewConfirm {...defaultProps} onEditStep={onEditStep} />);

    const editKycBtn = screen.getByLabelText(/Edit KYC & Address/i);
    fireEvent.click(editKycBtn);

    expect(onEditStep).toHaveBeenCalledWith(2);
  });

  it('renders Property & Scheme card with dimensions and calculated token fee', () => {
    render(<Step4ReviewConfirm {...defaultProps} />);

    expect(screen.getByText('Property & Scheme Details')).toBeInTheDocument();
    expect(screen.getByText('Shivani Vatika')).toBeInTheDocument();
    expect(screen.getByText('100-200 Sq. Yd')).toBeInTheDocument();
    expect(screen.getByText('≈ 900 Sq. Ft')).toBeInTheDocument();
    expect(screen.getByText('3 Equal Monthly Installments')).toBeInTheDocument();
    expect(screen.getByText('Online (UPI / Net Banking / Card)')).toBeInTheDocument();
    expect(screen.getByText('Park Facing Corner')).toBeInTheDocument();
    expect(screen.getAllByText(/₹21,000/i).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onEditStep(3) when clicking Edit on Property & Scheme card', () => {
    const onEditStep = vi.fn();
    render(<Step4ReviewConfirm {...defaultProps} onEditStep={onEditStep} />);

    const editPropertyBtn = screen.getByLabelText(/Edit Property & Scheme/i);
    fireEvent.click(editPropertyBtn);

    expect(onEditStep).toHaveBeenCalledWith(3);
  });

  it('embeds Captcha component and passes answer to onCaptchaValidate', () => {
    const onCaptchaValidate = vi.fn();
    render(<Step4ReviewConfirm {...defaultProps} onCaptchaValidate={onCaptchaValidate} />);

    expect(screen.getByTestId('captcha-component')).toBeInTheDocument();
    const captchaInput = screen.getByTestId('captcha-input');
    fireEvent.change(captchaInput, { target: { value: '42' } });

    expect(onCaptchaValidate).toHaveBeenCalledWith('42');
  });

  it('displays captcha error when provided', () => {
    render(<Step4ReviewConfirm {...defaultProps} captchaError="Please solve the captcha puzzle" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Please solve the captcha puzzle');
  });

  it('displays submitError banner when submission fails', () => {
    render(
      <Step4ReviewConfirm
        {...defaultProps}
        submitError="Network connectivity failed during allotment lock"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Network connectivity failed during allotment lock/i);
  });

  it('triggers onProceedToPayment when Proceed button is clicked', () => {
    const onProceedToPayment = vi.fn();
    render(<Step4ReviewConfirm {...defaultProps} onProceedToPayment={onProceedToPayment} />);

    const proceedBtn = screen.getByRole('button', { name: /Proceed to Payment/i });
    fireEvent.click(proceedBtn);

    expect(onProceedToPayment).toHaveBeenCalledTimes(1);
  });

  it('triggers onPrev when Back to Property button is clicked', () => {
    const onPrev = vi.fn();
    render(<Step4ReviewConfirm {...defaultProps} onPrev={onPrev} />);

    const backBtn = screen.getByRole('button', { name: /Back to Property/i });
    fireEvent.click(backBtn);

    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and displays spinner while submitting', () => {
    render(<Step4ReviewConfirm {...defaultProps} isSubmitting={true} />);

    const proceedBtn = screen.getByRole('button', { name: /Processing Application.../i });
    expect(proceedBtn).toBeDisabled();

    const backBtn = screen.getByRole('button', { name: /Back to Property/i });
    expect(backBtn).toBeDisabled();
  });
});
