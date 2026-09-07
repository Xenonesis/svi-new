import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentPlanHeader } from '@/src/components/admin/payment-plan/PaymentPlanHeader';

describe('PaymentPlanHeader', () => {
  it('renders the header title and subtitle correctly', () => {
    render(<PaymentPlanHeader />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Payment Plan Generator');
    expect(
      screen.getByText('Generate and download structured payment plans and EMIs.')
    ).toBeInTheDocument();
  });

  it('applies custom className if provided', () => {
    const { container } = render(<PaymentPlanHeader className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
