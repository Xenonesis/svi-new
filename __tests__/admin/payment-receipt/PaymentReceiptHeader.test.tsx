import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentReceiptHeader from '@/app/admin/payment-receipt/components/PaymentReceiptHeader';

describe('PaymentReceiptHeader', () => {
  it('renders title, subtitle, and handles reset button click via onReset', () => {
    const handleReset = vi.fn();
    render(<PaymentReceiptHeader onReset={handleReset} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toContain('Payment Receipt');
    expect(heading.textContent).toContain('Generator');
    expect(
      screen.getByText('Generate official payment receipts for client transactions.')
    ).toBeDefined();

    const newReceiptBtn = screen.getByRole('button', { name: /New Receipt/i });
    expect(newReceiptBtn).toBeDefined();
    fireEvent.click(newReceiptBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('handles reset button click via handleResetForm fallback prop', () => {
    const handleResetForm = vi.fn();
    render(<PaymentReceiptHeader handleResetForm={handleResetForm} />);

    const newReceiptBtn = screen.getByRole('button', { name: /New Receipt/i });
    fireEvent.click(newReceiptBtn);
    expect(handleResetForm).toHaveBeenCalledTimes(1);
  });
});
