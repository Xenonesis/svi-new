import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorridorEmiWidget } from '@/src/components/plots/common/CorridorEmiWidget';

describe('CorridorEmiWidget', () => {
  it('renders default corridor name and preset options', () => {
    render(<CorridorEmiWidget corridorName="Khatu Shyam Highway" />);

    expect(screen.getByText(/Estimate Your Plot EMI in Khatu Shyam Highway/i)).toBeInTheDocument();
    expect(screen.getByText('80 Sq. Yds (Compact)')).toBeInTheDocument();
    expect(screen.getByText('150 Sq. Yds (Standard)')).toBeInTheDocument();
    expect(screen.getByText('250 Sq. Yds (Executive)')).toBeInTheDocument();
  });
  it('updates loan calculation when preset is clicked', () => {
    render(<CorridorEmiWidget corridorName="Renwal Industrial Area" />);

    const compactButton = screen.getByRole('button', { name: /80 Sq. Yds/i });
    fireEvent.click(compactButton);

    expect(screen.getByText('₹4.80 Lakhs')).toBeInTheDocument();
  });

  it('renders Hindi localized text when isHindi is true', () => {
    render(<CorridorEmiWidget corridorName="खाटू श्याम जी हाईवे" isHindi={true} />);

    expect(
      screen.getByText(/खाटू श्याम जी हाईवे में अपने प्लॉट की ईएमआई का अनुमान लगाएं/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/मासिक ईएमआई/i)).toBeInTheDocument();
  });
});
