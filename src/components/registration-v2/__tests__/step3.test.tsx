import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchemeCalculatorV2 } from '../SchemeCalculatorV2';
import {
  Step3PropertyScheme,
  PROPERTY_SIZES,
  PROPERTY_TYPES,
  PLOT_PREFERENCES,
  PAYMENT_PLANS,
  PAYMENT_MODES,
} from '../steps/Step3PropertyScheme';
import { INITIAL_FORM_DATA, FormData } from '../types';

const mockT = (key: string): string => {
  const translations: Record<string, string> = {
    sectionProperty: 'Property Preferences & Scheme Selection',
    propertySubtitle:
      'Select your preferred township project, plot dimension, and payment schedule',
    selectProjects: 'Select Preferred Project',
    projectPlaceholder: 'Choose a SVI Mega Township',
    propertySize: 'Property Size (Plot Area)',
    sizePlaceholder: 'Or select plot size from list',
    propertyType: 'Property Type',
    typePlaceholder: 'Select Property Type',
    plotPreference: 'Plot Preference / Facing',
    preferencePlaceholder: 'Select Plot Preference',
    paymentPlan: 'Payment Plan',
    planPlaceholder: 'Choose Payment Plan',
    paymentMode: 'Payment Mode',
    modePlaceholder: 'Select Payment Mode',
    advisorName: 'Assigned Property Advisor',
    advisorPlaceholder: 'Select an Assigned Advisor',
    schemeAmount: 'Registration Token Fee (INR)',
    schemeAmountPlaceholder: 'Enter or confirm token amount',
    schemeAmountHint: 'Standard token amount based on selected plot dimension',
    prevStep: 'Back to KYC & Address',
    nextStep: 'Next: Review & Confirm',
  };
  return translations[key] || key;
};

describe('SchemeCalculatorV2', () => {
  it('renders official header and gold chip', () => {
    render(<SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="one-time" />);

    expect(screen.getByText(/LIVE SCHEME BREAKDOWN & TOKEN ESTIMATOR/i)).toBeInTheDocument();
    expect(screen.getByText('Official Scheme')).toBeInTheDocument();
  });

  it('renders formatted token fee for 100-200 sq. yard plot', () => {
    render(<SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="one-time" />);

    expect(screen.getByText('₹21,000')).toBeInTheDocument();
    expect(screen.getByText(/100% Adjustable Against Plot Cost/i)).toBeInTheDocument();
  });

  it('renders plot dimensions in sq. yards and sq. feet', () => {
    render(<SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="one-time" />);

    expect(screen.getByText('100 Sq. Yards')).toBeInTheDocument();
    expect(screen.getByText('(900 Sq. Ft)')).toBeInTheDocument();
  });

  it('renders payment term for one-time plan', () => {
    render(<SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="one-time" />);

    expect(screen.getByText('Full Lump-sum Payment')).toBeInTheDocument();
  });

  it('renders payment term for installment plans', () => {
    const { rerender } = render(
      <SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="3-months" />
    );
    expect(screen.getByText('3 Equal Monthly Installments')).toBeInTheDocument();

    rerender(<SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="6-months" />);
    expect(screen.getByText('6 Equal Monthly Installments')).toBeInTheDocument();

    rerender(<SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="12-months" />);
    expect(screen.getByText('12 Months Flexible Payment Plan')).toBeInTheDocument();
  });

  it('renders lottery allotment schedule and participation disclaimer', () => {
    render(<SchemeCalculatorV2 size="100-200" project="shivani-vatika" plan="one-time" />);

    expect(screen.getByText(/Upcoming Phase Draw & Priority Queue/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Token amount confirms lottery participation and is fully adjustable against plot cost\./i
      )
    ).toBeInTheDocument();
  });

  it('updates dynamically when size changes to 50-100 sq. yard', () => {
    render(<SchemeCalculatorV2 size="50-100" project="shivani-vatika" plan="one-time" />);

    expect(screen.getByText('50 Sq. Yards')).toBeInTheDocument();
    expect(screen.getByText('(450 Sq. Ft)')).toBeInTheDocument();
    expect(screen.getByText('₹11,000')).toBeInTheDocument();
  });

  it('updates dynamically when size changes to 1500-2000 sq. yard', () => {
    render(<SchemeCalculatorV2 size="1500-2000" project="shivani-vatika" plan="24-months" />);

    expect(screen.getByText('1,500 Sq. Yards')).toBeInTheDocument();
    expect(screen.getByText('(13,500 Sq. Ft)')).toBeInTheDocument();
    expect(screen.getByText('₹1,50,000')).toBeInTheDocument();
    expect(screen.getByText('24 Months Milestone Plan')).toBeInTheDocument();
  });

  it('safely handles unknown size with default calculation', () => {
    render(<SchemeCalculatorV2 size="" project="" plan="" />);

    expect(screen.getByText('100 Sq. Yards')).toBeInTheDocument();
    expect(screen.getByText('(900 Sq. Ft)')).toBeInTheDocument();
    expect(screen.getByText('₹21,000')).toBeInTheDocument();
  });
});

describe('Step3PropertyScheme', () => {
  const baseFormData: FormData = {
    ...INITIAL_FORM_DATA,
    project: 'shivani-vatika',
    propertySize: '100-200',
    propertyType: 'residential-plot',
    plotPreference: 'park',
    paymentPlan: '3-months',
    paymentMode: 'online',
    advisorName: 'Ajeet Kumar',
    schemeAmount: '21000',
  };

  const defaultProjects = [
    { value: 'shivani-vatika', label: 'Shivani Vatika - Phase 1' },
    { value: 'shayam-angan', label: 'Shayam Angan - Luxury Greens' },
  ];

  const defaultAdvisors = ['Ajeet Kumar', 'Sanjay Sharma', 'Pooja Singh'];

  const defaultProps = {
    formData: baseFormData,
    errors: {},
    attempted: false,
    t: mockT,
    onChange: vi.fn(),
    advisors: defaultAdvisors,
    projects: defaultProjects,
    onNext: vi.fn(),
    onPrev: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields with initial values', () => {
    render(<Step3PropertyScheme {...defaultProps} />);

    const projectSelect = screen.getByLabelText(/Select Preferred Project/i) as HTMLSelectElement;
    expect(projectSelect.value).toBe('shivani-vatika');

    const sizeSelect = screen.getByLabelText(/Property Size \(Plot Area\)/i) as HTMLSelectElement;
    expect(sizeSelect.value).toBe('100-200');
    const typeSelect = screen.getByRole('combobox', {
      name: /Property Type/i,
    }) as HTMLSelectElement;
    expect(typeSelect.value).toBe('residential-plot');

    const prefSelect = screen.getByRole('combobox', {
      name: /Plot Preference \/ Facing/i,
    }) as HTMLSelectElement;
    expect(prefSelect.value).toBe('park');
    const planSelect = screen.getByLabelText(/Payment Plan/i) as HTMLSelectElement;
    expect(planSelect.value).toBe('3-months');

    const modeSelect = screen.getByLabelText(/Payment Mode/i) as HTMLSelectElement;
    expect(modeSelect.value).toBe('online');

    const advisorSelect = screen.getByLabelText(/Assigned Property Advisor/i) as HTMLSelectElement;
    expect(advisorSelect.value).toBe('Ajeet Kumar');

    const amountInput = screen.getByLabelText(
      /Registration Token Fee \(INR\)/i
    ) as HTMLInputElement;
    expect(amountInput.value).toBe('21000');
  });

  it('populates projects from projects prop', () => {
    render(<Step3PropertyScheme {...defaultProps} />);

    expect(screen.getByText('Shivani Vatika - Phase 1')).toBeInTheDocument();
    expect(screen.getByText('Shayam Angan - Luxury Greens')).toBeInTheDocument();
  });

  it('populates advisors from advisors prop', () => {
    render(<Step3PropertyScheme {...defaultProps} />);

    expect(screen.getByRole('option', { name: 'Ajeet Kumar' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sanjay Sharma' })).toBeInTheDocument();
  });

  it('falls back to default projects and advisors when props are empty', () => {
    render(<Step3PropertyScheme {...defaultProps} projects={[]} advisors={[]} />);

    expect(screen.getByText('Shivani Vatika')).toBeInTheDocument();
    expect(screen.getByText('Direct / SVI Official')).toBeInTheDocument();
  });

  it('clicking a property size pill triggers onChange for propertySize and schemeAmount', () => {
    const handleChange = vi.fn();
    render(<Step3PropertyScheme {...defaultProps} onChange={handleChange} />);

    const pill200 = screen.getByRole('radio', { name: /200-400 Sq\. Yd/i });
    fireEvent.click(pill200);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'propertySize',
          value: '200-400',
        }),
      })
    );

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'schemeAmount',
          value: '31000',
        }),
      })
    );
  });

  it('changing property size select triggers size and amount update', () => {
    const handleChange = vi.fn();
    render(<Step3PropertyScheme {...defaultProps} onChange={handleChange} />);

    const sizeSelect = screen.getByLabelText(/Property Size \(Plot Area\)/i);
    fireEvent.change(sizeSelect, { target: { value: '400-700' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'propertySize',
          value: '400-700',
        }),
      })
    );

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'schemeAmount',
          value: '51000',
        }),
      })
    );
  });

  it('clicking property type pill triggers onChange', () => {
    const handleChange = vi.fn();
    render(<Step3PropertyScheme {...defaultProps} onChange={handleChange} />);

    const commercialPill = screen.getByRole('radio', { name: /Commercial Units/i });
    fireEvent.click(commercialPill);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'propertyType',
          value: 'commercial-shop',
        }),
      })
    );
  });

  it('clicking plot preference pill triggers onChange', () => {
    const handleChange = vi.fn();
    render(<Step3PropertyScheme {...defaultProps} onChange={handleChange} />);

    const cornerPill = screen.getByRole('radio', { name: /Corner Plot/i });
    fireEvent.click(cornerPill);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'plotPreference',
          value: 'corner',
        }),
      })
    );
  });

  it('changing dropdown selects triggers onChange', () => {
    const captured: { name: string; value: string }[] = [];
    const handleChange = vi.fn(
      (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        captured.push({ name: e.target.name, value: e.target.value });
      }
    );
    render(<Step3PropertyScheme {...defaultProps} onChange={handleChange} />);

    // Project
    const projectSelect = screen.getByRole('combobox', { name: /Select Preferred Project/i });
    fireEvent.change(projectSelect, { target: { name: 'project', value: 'shayam-angan' } });
    expect(captured).toContainEqual({ name: 'project', value: 'shayam-angan' });

    // Payment Plan
    const planSelect = screen.getByRole('combobox', { name: /Payment Plan/i });
    fireEvent.change(planSelect, { target: { name: 'paymentPlan', value: '12-months' } });
    expect(captured).toContainEqual({ name: 'paymentPlan', value: '12-months' });

    // Payment Mode
    const modeSelect = screen.getByRole('combobox', { name: /Payment Mode/i });
    fireEvent.change(modeSelect, { target: { name: 'paymentMode', value: 'cash' } });
    expect(captured).toContainEqual({ name: 'paymentMode', value: 'cash' });

    // Advisor
    const advisorSelect = screen.getByRole('combobox', { name: /Assigned Property Advisor/i });
    fireEvent.change(advisorSelect, { target: { name: 'advisorName', value: 'Sanjay Sharma' } });
    expect(captured).toContainEqual({ name: 'advisorName', value: 'Sanjay Sharma' });
  });

  it('renders validation error alerts and aria-invalid on invalid fields', () => {
    const errors = {
      project: 'Project selection is required',
      propertySize: 'Plot size is required',
      propertyType: 'Property type is required',
      paymentPlan: 'Payment plan is required',
      paymentMode: 'Payment mode is required',
      advisorName: 'Advisor selection is required',
      schemeAmount: 'Token amount is required',
    };
    render(<Step3PropertyScheme {...defaultProps} errors={errors} attempted={true} />);

    expect(screen.getByText('Project selection is required')).toBeInTheDocument();
    expect(screen.getByText('Plot size is required')).toBeInTheDocument();
    expect(screen.getByText('Property type is required')).toBeInTheDocument();
    expect(screen.getByText('Payment plan is required')).toBeInTheDocument();
    expect(screen.getByText('Payment mode is required')).toBeInTheDocument();
    expect(screen.getByText('Token amount is required')).toBeInTheDocument();
    expect(screen.getByText('Advisor selection is required')).toBeInTheDocument();

    expect(screen.getByLabelText(/Select Preferred Project/i).getAttribute('aria-invalid')).toBe(
      'true'
    );
    expect(screen.getByLabelText(/Payment Plan/i).getAttribute('aria-invalid')).toBe('true');
  });

  it('calls onPrev when Back button is clicked', () => {
    const handlePrev = vi.fn();
    render(<Step3PropertyScheme {...defaultProps} onPrev={handlePrev} />);

    const backButton = screen.getByRole('button', { name: /Back to KYC & Address/i });
    fireEvent.click(backButton);

    expect(handlePrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when Next button is clicked', () => {
    const handleNext = vi.fn();
    render(<Step3PropertyScheme {...defaultProps} onNext={handleNext} />);

    const nextButton = screen.getByRole('button', { name: /Next: Review & Confirm/i });
    fireEvent.click(nextButton);

    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('toggles mobile calculator accordion when mobile button is clicked', () => {
    render(<Step3PropertyScheme {...defaultProps} />);

    const mobileToggle = screen.getByRole('button', { name: /Show Live Scheme Breakdown/i });
    expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(mobileToggle);
    expect(screen.getByRole('button', { name: /Hide Live Scheme Breakdown/i })).toBeInTheDocument();

    fireEvent.click(mobileToggle);
    expect(screen.getByRole('button', { name: /Show Live Scheme Breakdown/i })).toBeInTheDocument();
  });

  it('ensures touch targets are at least 44px', () => {
    render(<Step3PropertyScheme {...defaultProps} />);

    const backButton = screen.getByRole('button', { name: /Back to KYC & Address/i });
    expect(backButton.className).toContain('min-h-[44px]');

    const nextButton = screen.getByRole('button', { name: /Next: Review & Confirm/i });
    expect(nextButton.className).toContain('min-h-[44px]');
  });
});
