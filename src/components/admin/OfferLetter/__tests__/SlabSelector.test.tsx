import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { SlabSelector } from '../SlabSelector';

describe('SlabSelector', () => {
  const mockProps = {
    salaryCtc: '',
    target: '',
    offerSlab: '',
    onSalaryChange: vi.fn(),
    onTargetChange: vi.fn(),
    onOfferSlabChange: vi.fn(),
    onSalarySelect: vi.fn(),
    onTargetSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders salary, target, and offer slab inputs', () => {
    render(<SlabSelector {...mockProps} />);

    expect(screen.getByText('Salary (CTC) / month')).toBeInTheDocument();
    expect(screen.getByText('Target (Sq. Yd.)')).toBeInTheDocument();
    expect(screen.getByText('Offer Slab (%)')).toBeInTheDocument();
  });

  it('calls onSalaryChange when salary input changes', () => {
    render(<SlabSelector {...mockProps} />);

    const salaryInput = document.querySelector('[name="salaryCtc"]') as HTMLInputElement;
    fireEvent.change(salaryInput, { target: { value: '25000' } });

    expect(mockProps.onSalaryChange).toHaveBeenCalledWith('25000');
  });

  it('calls onOfferSlabChange when offer slab input changes', () => {
    render(<SlabSelector {...mockProps} />);

    const slabInput = document.querySelector('[name="offerSlab"]') as HTMLInputElement;
    fireEvent.change(slabInput, { target: { value: '5' } });

    expect(mockProps.onOfferSlabChange).toHaveBeenCalledWith('5');
  });

  it('renders with number type for offer slab input', () => {
    render(<SlabSelector {...mockProps} />);

    const slabInput = document.querySelector('[name="offerSlab"]') as HTMLInputElement;
    expect(slabInput).toHaveAttribute('type', 'number');
  });

  it('shows matching slab info when salary is entered', () => {
    render(<SlabSelector {...mockProps} salaryCtc="17000" />);

    expect(screen.getByText('120 Sq.Yd')).toBeInTheDocument();
  });

  it('shows matching slab info when target is entered', () => {
    render(<SlabSelector {...mockProps} target="120" />);

    expect(screen.getByText('₹17,000')).toBeInTheDocument();
  });
});
