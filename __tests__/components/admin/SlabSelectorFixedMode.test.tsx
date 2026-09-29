import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SlabSelector } from '@/src/components/admin/OfferLetter/SlabSelector';

describe('SlabSelector Fixed Salary Mode', () => {
  it('renders fixed salary toggle button and allows switching modes', () => {
    const handleToggleFixedSalary = vi.fn();
    render(
      <SlabSelector
        salaryCtc="35000"
        target="380"
        offerSlab="3"
        isFixedSalary={false}
        onSalaryChange={vi.fn()}
        onTargetChange={vi.fn()}
        onOfferSlabChange={vi.fn()}
        onSalarySelect={vi.fn()}
        onTargetSelect={vi.fn()}
        onToggleFixedSalary={handleToggleFixedSalary}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /Target Slab Linked/i });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(handleToggleFixedSalary).toHaveBeenCalledWith(true);
  });

  it('disables target and offer slab inputs when isFixedSalary is true', () => {
    render(
      <SlabSelector
        salaryCtc="35000"
        target="380"
        offerSlab="3"
        isFixedSalary={true}
        onSalaryChange={vi.fn()}
        onTargetChange={vi.fn()}
        onOfferSlabChange={vi.fn()}
        onSalarySelect={vi.fn()}
        onTargetSelect={vi.fn()}
        onToggleFixedSalary={vi.fn()}
      />
    );

    const targetInput = screen.getByPlaceholderText('N/A (Fixed Salary)');
    expect(targetInput).toBeDisabled();

    const offerSlabInput = screen.getByPlaceholderText('N/A');
    expect(offerSlabInput).toBeDisabled();

    expect(screen.getByRole('button', { name: /Fixed Salary \(No Quota\)/i })).toBeInTheDocument();
  });
});
