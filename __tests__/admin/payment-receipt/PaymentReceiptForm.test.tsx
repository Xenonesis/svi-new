import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentReceiptForm from '@/app/admin/payment-receipt/components/PaymentReceiptForm';

describe('PaymentReceiptForm', () => {
  const defaultFormData = {
    receiptNo: '2095',
    date: '2026-09-05',
    salutation: 'Mr.',
    name: 'Piyush Sharma',
    refId: 'SVI2051',
    amount: '16042',
    amountWords: 'Sixteen Thousand Forty Two',
    paymentRef: 'UPI12345',
    drawnOn: 'HDFC Bank',
    plotNo: '42',
    plotSize: '1000',
    account: 'Savings',
    paymentMethod: 'UPI',
    clientPhone: '9876543210',
  };

  it('renders Client Mobile / WhatsApp input with current value and handles change', () => {
    const handleChange = vi.fn();
    render(
      <PaymentReceiptForm
        formData={defaultFormData}
        handleChange={handleChange}
        handleSubmit={vi.fn()}
        termsAccepted={true}
        setTermsAccepted={vi.fn()}
      />
    );

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number') as HTMLInputElement;
    expect(phoneInput).toBeDefined();
    expect(phoneInput.value).toBe('9876543210');

    fireEvent.change(phoneInput, { target: { name: 'clientPhone', value: '7300007643' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders Ref. Id input with current value and invokes handleChange on input', () => {
    const handleChange = vi.fn();
    render(
      <PaymentReceiptForm
        formData={defaultFormData}
        handleChange={handleChange}
        handleSubmit={vi.fn()}
        termsAccepted={true}
        setTermsAccepted={vi.fn()}
      />
    );

    const refInput = screen.getByPlaceholderText('Search or enter Ref. ID...') as HTMLInputElement;
    expect(refInput.value).toBe('SVI2051');

    fireEvent.change(refInput, { target: { value: 'SVI9999' } });
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'refId', value: 'SVI9999' }),
      })
    );
  });

  it('renders suggestions and fires onSelectRefProfile when a suggestion is clicked', () => {
    const onSelectRefProfile = vi.fn();
    const mockProfiles = [
      {
        refId: 'SVI2051',
        name: 'Piyush Sharma',
        salutation: 'Mr.',
        clientPhone: '9876543210',
        plotNo: '42',
        plotSize: '1000',
        account: 'Shivani Vatika',
        source: 'receipt' as const,
      },
      {
        refId: 'PL2078',
        name: 'Rani Bhatnagar',
        salutation: 'Mrs.',
        clientPhone: '8888888888',
        plotNo: '12',
        plotSize: '200',
        account: 'Phulera SmartCity',
        source: 'candidate' as const,
      },
    ];

    render(
      <PaymentReceiptForm
        formData={{ ...defaultFormData, refId: '' }}
        handleChange={vi.fn()}
        handleSubmit={vi.fn()}
        termsAccepted={true}
        setTermsAccepted={vi.fn()}
        refIdProfiles={mockProfiles}
        onSelectRefProfile={onSelectRefProfile}
      />
    );

    const refInput = screen.getByPlaceholderText('Search or enter Ref. ID...');
    fireEvent.focus(refInput);

    const suggestion = screen.getByText('Rani Bhatnagar');
    fireEvent.click(suggestion);

    expect(onSelectRefProfile).toHaveBeenCalledWith(mockProfiles[1]);
  });
});
