import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegistrationWizardV2 } from '../RegistrationWizardV2';
import { DRAFT_STORAGE_KEY } from '../useRegistrationV2';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      title: 'Property Registration & Lottery Application',
      subtitle:
        'Complete your verified priority allotment application in 4 straightforward steps with guaranteed allotment transparency.',
      'paymentModal.title': 'Application Amount & Banking Information',
      'paymentModal.subtitle': 'Payment Details for Allotment Deposit',
      'paymentModal.confirm': 'I Have Completed Payment',
      'paymentModal.close': 'Cancel / Close',
      'validation.captchaRequired': 'Captcha is required',
    };
    return (key: string) => translations[key] || key;
  },
}));

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

vi.mock('@/src/components/registration/PaymentModal', () => ({
  default: ({
    onClose,
    onConfirm,
    submitError,
  }: {
    onClose: () => void;
    onConfirm: () => void;
    submitError?: string;
  }) => (
    <div data-testid="payment-modal" role="dialog" aria-modal="true">
      <h2>Payment Modal Open</h2>
      {submitError && <p role="alert">{submitError}</p>}
      <button type="button" onClick={onConfirm}>
        Confirm Payment
      </button>
      <button type="button" onClick={onClose}>
        Close Modal
      </button>
    </div>
  ),
}));

describe('RegistrationWizardV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (
        typeof url === 'string' &&
        (url.includes('/api/registration/advisors') || url === '/api/registration')
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ advisors: ['Direct / SVI Official', 'Ajeet Kumar'] }),
        });
      }
      if (
        typeof url === 'string' &&
        (url.includes('/api/registration/projects') || url === '/api/properties')
      ) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              projects: [{ value: 'shivani-vatika', label: 'Shivani Vatika' }],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('renders wizard shell with title, progress bar, and trust banners', () => {
    render(<RegistrationWizardV2 />);

    expect(screen.getByText('SVI INFRA TOWNSHIPS • PRIORITY ALLOTMENT')).toBeInTheDocument();
    expect(screen.getByText('Property Registration & Lottery Application')).toBeInTheDocument();

    // Trust banners render
    expect(screen.getAllByText('1,200+').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Registered Allottees/i).length).toBeGreaterThanOrEqual(1);
    // Progress bar renders with all 4 steps
    expect(screen.getAllByText('Applicant').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('KYC & Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Property & Scheme').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review & Pay').length).toBeGreaterThanOrEqual(1);

    // Default step is Step 1 (Applicant)
    expect(screen.getByText('Applicant Personal Details')).toBeInTheDocument();
  });

  it('displays draft restored banner when draft is detected in localStorage', () => {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        firstName: 'RAJESH',
        lastName: 'SHARMA',
        mobileNo: '9876543210',
        email: 'rajesh@example.com',
      })
    );

    render(<RegistrationWizardV2 />);

    expect(screen.getByText('Draft Application Restored')).toBeInTheDocument();
    expect(screen.getByText(/We restored your previously saved inputs/i)).toBeInTheDocument();

    // First name input should be pre-filled
    const firstNameInput = screen.getByLabelText(/First Name/i) as HTMLInputElement;
    expect(firstNameInput.value).toBe('RAJESH');

    // Click discard draft
    const discardBtn = screen.getByRole('button', { name: /Discard Draft/i });
    fireEvent.click(discardBtn);

    // Draft key should be removed
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('can navigate from Step 1 to Step 2 when valid data is entered', async () => {
    render(<RegistrationWizardV2 />);

    // Fill valid Step 1 details
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'VIKRAM' },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'SINGH' },
    });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), {
      target: { value: '9876543210' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'vikram@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Father \/ Husband \/ Guardian/i), {
      target: { value: 'MAHENDRA SINGH' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1992-04-10' },
    });

    const nextBtn = screen.getByRole('button', { name: /Next: KYC & Address/i });
    fireEvent.click(nextBtn);

    // Now Step 2 should be visible
    await waitFor(() => {
      expect(screen.getByText('KYC & Address Verification')).toBeInTheDocument();
    });
  });

  it('renders Step 4 and opens PaymentModal when Proceed to Payment is triggered with valid captcha', async () => {
    // Pre-seed localStorage with all valid steps data
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        firstName: 'ANITA',
        lastName: 'DESHMUKH',
        mobileNo: '9876543210',
        email: 'anita@example.com',
        soWoDo: 'W/O SURESH DESHMUKH',
        dob: '1988-06-20',
        aadharNumber: '2345 6789 0123',
        panNumber: 'ABCDE1234F',
        pincode: '201301',
        state: 'UTTAR PRADESH',
        city: 'NOIDA',
        address: 'SECTOR 15, NOIDA',
        project: 'shivani-vatika',
        propertySize: '100-200',
        propertyType: 'residential-plot',
        plotPreference: 'park',
        paymentPlan: 'one-time',
        paymentMode: 'online',
        schemeAmount: '21000',
      })
    );

    render(<RegistrationWizardV2 />);

    // Click step 4 in the progress bar
    const step4Btn = screen.getByLabelText(/Step 4: Review & Pay/i);
    fireEvent.click(step4Btn);

    // Verify Review step is displayed
    await waitFor(() => {
      expect(screen.getByText('Review & Confirm Application')).toBeInTheDocument();
    });

    // Solve captcha
    const captchaInput = screen.getByTestId('captcha-input');
    fireEvent.change(captchaInput, { target: { value: '14' } });

    // Click Proceed to Payment
    const proceedBtn = screen.getByRole('button', { name: /Proceed to Payment/i });
    fireEvent.click(proceedBtn);

    // Payment modal should open
    await waitFor(() => {
      expect(screen.getByTestId('payment-modal')).toBeInTheDocument();
    });

    // Clicking close should dismiss modal
    const closeBtn = screen.getByRole('button', { name: /Close Modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument();
    });
  });
});
