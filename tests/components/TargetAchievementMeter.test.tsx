import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TargetAchievementMeter } from '@/src/components/admin/dashboard/executive/TargetAchievementMeter';
import { InventoryPulseWidget } from '@/src/components/admin/dashboard/executive/InventoryPulseWidget';

describe('TargetAchievementMeter', () => {
  it('renders target pacing percentage and ahead status', () => {
    const mockTarget = {
      monthlyTarget: 5000000,
      currentCollections: 4200000,
      percentage: 84,
      projectedTotal: 5200000,
      status: 'ahead' as const,
      dailyRunRateNeeded: 114285,
    };

    render(<TargetAchievementMeter target={mockTarget} />);
    expect(screen.getByText(/Monthly Target Pacing/i)).toBeDefined();
    expect(screen.getByText('Target: ₹50.0L')).toBeDefined();
    expect(screen.getByText('₹42.0L')).toBeDefined();
    expect(screen.getByText('84%')).toBeDefined();
    expect(screen.getByText(/Ahead of Target/i)).toBeDefined();
    expect(screen.getByText('₹52.0L')).toBeDefined();
    expect(screen.getByText('₹114k / day')).toBeDefined();
  });

  it('renders pacing gap status when behind target', () => {
    const mockTarget = {
      monthlyTarget: 5000000,
      currentCollections: 1500000,
      percentage: 30,
      projectedTotal: 3000000,
      status: 'behind' as const,
      dailyRunRateNeeded: 250000,
    };

    render(<TargetAchievementMeter target={mockTarget} />);
    expect(screen.getByText(/Monthly Target Pacing/i)).toBeDefined();
    expect(screen.getByText('Target: ₹50.0L')).toBeDefined();
    expect(screen.getByText('₹15.0L')).toBeDefined();
    expect(screen.getByText('30%')).toBeDefined();
    expect(screen.getByText(/Pacing Gap/i)).toBeDefined();
    expect(screen.getByText('₹30.0L')).toBeDefined();
    expect(screen.getByText('₹250k / day')).toBeDefined();
  });
});

describe('InventoryPulseWidget', () => {
  const mockProperties = [
    { name: 'Shreeji Valley - Phase 1', slug: 'shreeji-valley-phase-1' },
    { name: 'Shreeji Heights', slug: 'shreeji-heights' },
  ];

  const mockInventory = {
    'Shreeji Valley - Phase 1': { total: 60, allotted: 39, reserved: 8, available: 13 },
    'Shreeji Heights': { total: 50, allotted: 10, reserved: 5, available: 35 },
  };

  it('renders inventory pulse widget with occupancy and link', () => {
    render(
      <InventoryPulseWidget properties={mockProperties} inventoryByProperty={mockInventory} />
    );
    expect(screen.getByText('Project Inventory Pulse')).toBeDefined();
    expect(screen.getByText(/Allotment & booking status/i)).toBeDefined();
    expect(screen.getByText('60')).toBeDefined();
    expect(screen.getByText('65% Occupancy')).toBeDefined();
    expect(screen.getByText('Allotted (39)')).toBeDefined();
    expect(screen.getByText('Reserved (8)')).toBeDefined();
    expect(screen.getByText('Available (13)')).toBeDefined();

    const link = screen.getByRole('link', { name: /Create Allotment/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/admin/allotment-letter');
  });
  it('allows selecting different properties from dropdown', () => {
    render(<InventoryPulseWidget properties={mockProperties} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDefined();

    fireEvent.change(select, { target: { value: 'Shreeji Heights' } });
    expect((select as HTMLSelectElement).value).toBe('Shreeji Heights');
  });

  it('renders default fallback option when properties list is empty', () => {
    render(<InventoryPulseWidget properties={[]} />);
    expect(screen.getByText('Project Inventory Pulse')).toBeDefined();
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('Shyam Aangan Phase 1');
  });
});
