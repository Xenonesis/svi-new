import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepProgressBar, REGISTRATION_STEPS } from '../StepProgressBar';
import { TrustBannerV2 } from '../TrustBannerV2';
import { Step1Applicant } from '../steps/Step1Applicant';
import { INITIAL_FORM_DATA, FormData } from '../types';

const mockT = (key: string): string => {
  const translations: Record<string, string> = {
    firstName: 'First Name',
    firstNamePlaceholder: 'ENTER FIRST NAME',
    lastName: 'Last Name',
    lastNamePlaceholder: 'ENTER LAST NAME',
    mobileNo: 'Mobile Number',
    mobilePlaceholder: '9876543210',
    email: 'Email Address',
    emailPlaceholder: 'NAME@EXAMPLE.COM',
    soWoDo: 'Father / Husband / Guardian',
    soWoDoPlaceholder: "ENTER RELATIVE'S FULL NAME",
    dob: 'Date of Birth',
    sectionPersonal: 'Applicant Personal Details',
  };
  return translations[key] || key;
};

describe('StepProgressBar', () => {
  it('renders all 4 steps with titles', () => {
    render(<StepProgressBar currentStep={1} />);

    expect(screen.getAllByText('Applicant').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('KYC & Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Property & Scheme').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review & Pay').length).toBeGreaterThanOrEqual(1);
  });

  it('marks current step with aria-current="step"', () => {
    render(<StepProgressBar currentStep={2} />);

    const step2Button = screen.getByLabelText(/Step 2: KYC & Address \(Current Step\)/i);
    expect(step2Button.getAttribute('aria-current')).toBe('step');

    const step1Button = screen.getByLabelText(/Step 1: Applicant \(Completed\)/i);
    expect(step1Button.getAttribute('aria-current')).toBeNull();
  });

  it('renders completed checkmark for steps before currentStep', () => {
    const { container } = render(<StepProgressBar currentStep={3} />);

    // Steps 1 and 2 should be marked completed
    expect(screen.getByLabelText(/Step 1: Applicant \(Completed\)/i)).toBeDefined();
    expect(screen.getByLabelText(/Step 2: KYC & Address \(Completed\)/i)).toBeDefined();
    expect(screen.getByLabelText(/Step 3: Property & Scheme \(Current Step\)/i)).toBeDefined();
    expect(screen.getByLabelText(/Step 4: Review & Pay \(Upcoming\)/i)).toBeDefined();

    // Check SVG checkmarks are rendered for completed steps
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('invokes onSelectStep when step node is clicked', () => {
    const handleSelectStep = vi.fn();
    render(<StepProgressBar currentStep={1} onSelectStep={handleSelectStep} />);

    const step2Button = screen.getByLabelText(/Step 2: KYC & Address/i);
    fireEvent.click(step2Button);

    expect(handleSelectStep).toHaveBeenCalledWith(2);
  });

  it('ensures touch targets are at least 44px', () => {
    render(<StepProgressBar currentStep={1} onSelectStep={() => {}} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.className).toContain('min-h-[44px]');
      expect(btn.className).toContain('min-w-[44px]');
    });
  });

  it('renders mobile step indicator pill', () => {
    render(<StepProgressBar currentStep={2} />);
    expect(screen.getByText('Step 2 of 4: KYC & Address')).toBeDefined();
  });
});

describe('TrustBannerV2', () => {
  it('renders SVI Verified Scheme badge', () => {
    render(<TrustBannerV2 />);
    expect(screen.getByText('SVI Verified Scheme')).toBeDefined();
  });

  it('renders allottees stat text', () => {
    render(<TrustBannerV2 allotteesCount="1,200+" />);
    expect(screen.getByText(/1,200\+/i)).toBeDefined();
    expect(screen.getByText(/Registered Allottees in Noida & Jaipur Expressway/i)).toBeDefined();
  });

  it('renders helpdesk phone call shortcut with min 44px touch target', () => {
    render(<TrustBannerV2 phone="+91 9216014579" />);

    const callLink = screen.getByLabelText(/Call SVI Helpdesk at \+91 9216014579/i);
    expect(callLink.getAttribute('href')).toBe('tel:+919216014579');
    expect(callLink.className).toContain('min-h-[44px]');
  });

  it('renders WhatsApp direct link with sanitized number', () => {
    render(<TrustBannerV2 phone="+91 9216014579" />);

    const waLink = screen.getByLabelText(/Chat with SVI Helpdesk on WhatsApp/i);
    expect(waLink.getAttribute('href')).toContain('https://wa.me/919216014579');
    expect(waLink.className).toContain('min-h-[44px]');
  });
});

describe('Step1Applicant', () => {
  const baseFormData: FormData = {
    ...INITIAL_FORM_DATA,
    firstName: 'RAMESH',
    lastName: 'KUMAR',
    mobileNo: '9876543210',
    email: 'RAMESH@EXAMPLE.COM',
    soWoDo: 'S/O SURESH KUMAR',
    dob: '1990-05-15',
  };

  it('renders all form input fields with initial values', () => {
    render(
      <Step1Applicant
        formData={baseFormData}
        errors={{}}
        attempted={false}
        t={mockT}
        onChange={() => {}}
        onNext={() => {}}
      />
    );

    const firstNameInput = screen.getByLabelText(/First Name/i) as HTMLInputElement;
    expect(firstNameInput.value).toBe('RAMESH');

    const lastNameInput = screen.getByLabelText(/Last Name/i) as HTMLInputElement;
    expect(lastNameInput.value).toBe('KUMAR');

    const mobileInput = screen.getByLabelText(/Mobile Number/i) as HTMLInputElement;
    expect(mobileInput.value).toBe('9876543210');

    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    expect(emailInput.value).toBe('RAMESH@EXAMPLE.COM');

    const dobInput = screen.getByLabelText(/Date of Birth/i) as HTMLInputElement;
    expect(dobInput.value).toBe('1990-05-15');

    const relativeInput = screen.getByPlaceholderText(
      "ENTER RELATIVE'S FULL NAME"
    ) as HTMLInputElement;
    expect(relativeInput.value).toBe('SURESH KUMAR');

    const relationSelect = screen.getByLabelText(/Relationship prefix/i) as HTMLSelectElement;
    expect(relationSelect.value).toBe('S/O');
  });

  it('has touch targets of at least 44px on all inputs and buttons', () => {
    render(
      <Step1Applicant
        formData={baseFormData}
        errors={{}}
        attempted={false}
        t={mockT}
        onChange={() => {}}
        onNext={() => {}}
      />
    );

    const firstName = screen.getByLabelText(/First Name/i);
    expect(firstName.className).toContain('min-h-[44px]');

    const nextBtn = screen.getByRole('button', { name: /Next: KYC & Address/i });
    expect(nextBtn.className).toContain('min-h-[44px]');
  });

  it('calls onChange when user types in first name', () => {
    const handleChange = vi.fn();
    render(
      <Step1Applicant
        formData={INITIAL_FORM_DATA}
        errors={{}}
        attempted={false}
        t={mockT}
        onChange={handleChange}
        onNext={() => {}}
      />
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'ANITA' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('sanitizes non-digits from mobile number input', () => {
    const handleChange = vi.fn();
    render(
      <Step1Applicant
        formData={INITIAL_FORM_DATA}
        errors={{}}
        attempted={false}
        t={mockT}
        onChange={handleChange}
        onNext={() => {}}
      />
    );

    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    fireEvent.change(mobileInput, { target: { name: 'mobileNo', value: '+91-987abc6543210' } });

    expect(handleChange).toHaveBeenCalled();
    const eventArg = handleChange.mock.calls[0][0];
    expect(eventArg.target.value).toBe('9198765432'); // first 10 digits
  });

  it('emits formatted relation string when prefix changes', () => {
    const handleChange = vi.fn();
    render(
      <Step1Applicant
        formData={{ ...INITIAL_FORM_DATA, soWoDo: 'S/O SURESH KUMAR' }}
        errors={{}}
        attempted={false}
        t={mockT}
        onChange={handleChange}
        onNext={() => {}}
      />
    );

    const relationSelect = screen.getByLabelText(/Relationship prefix/i);
    fireEvent.change(relationSelect, { target: { value: 'W/O' } });

    expect(handleChange).toHaveBeenCalled();
    const eventArg = handleChange.mock.calls[0][0];
    expect(eventArg.target.name).toBe('soWoDo');
    expect(eventArg.target.value).toBe('W/O SURESH KUMAR');
  });

  it('emits formatted relation string when relative name changes', () => {
    const handleChange = vi.fn();
    render(
      <Step1Applicant
        formData={INITIAL_FORM_DATA}
        errors={{}}
        attempted={false}
        t={mockT}
        onChange={handleChange}
        onNext={() => {}}
      />
    );

    const relativeInput = screen.getByPlaceholderText("ENTER RELATIVE'S FULL NAME");
    fireEvent.change(relativeInput, { target: { value: 'mohan lal' } });

    expect(handleChange).toHaveBeenCalled();
    const eventArg = handleChange.mock.calls[0][0];
    expect(eventArg.target.name).toBe('soWoDo');
    expect(eventArg.target.value).toBe('S/O MOHAN LAL');
  });

  it('renders validation error messages and aria-invalid attributes', () => {
    const errors = {
      firstName: 'First name is required',
      mobileNo: 'Please enter a valid 10-digit mobile number',
      email: 'Email is required',
      soWoDo: 'Relative details required',
      dob: 'Applicant must be at least 18 years old',
    };

    render(
      <Step1Applicant
        formData={INITIAL_FORM_DATA}
        errors={errors}
        attempted={true}
        t={mockT}
        onChange={() => {}}
        onNext={() => {}}
      />
    );

    expect(screen.getByText('First name is required')).toBeDefined();
    expect(screen.getByText('Please enter a valid 10-digit mobile number')).toBeDefined();
    expect(screen.getByText('Email is required')).toBeDefined();
    expect(screen.getByText('Relative details required')).toBeDefined();
    expect(screen.getByText('Applicant must be at least 18 years old')).toBeDefined();

    const firstNameInput = screen.getByLabelText(/First Name/i);
    expect(firstNameInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('calls onNext when Next button is clicked', () => {
    const handleNext = vi.fn();
    render(
      <Step1Applicant
        formData={baseFormData}
        errors={{}}
        attempted={false}
        t={mockT}
        onChange={() => {}}
        onNext={handleNext}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /Next: KYC & Address/i });
    fireEvent.click(nextBtn);

    expect(handleNext).toHaveBeenCalledTimes(1);
  });
});
