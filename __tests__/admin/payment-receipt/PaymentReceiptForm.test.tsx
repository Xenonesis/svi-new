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
});
