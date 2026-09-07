import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortalAllotmentFormModal } from '@/src/components/admin/portal-allotments/PortalAllotmentFormModal';
import type {
  AllotmentFormData,
  ProfileSummary,
  PropertySummary,
} from '@/src/components/admin/portal-allotments/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      newAllotment: 'New Allotment',
      editAllotment: 'Edit Allotment',
      clientProfile: 'Client Profile',
      selectClient: 'Select a client...',
      property: 'Property',
      selectProperty: 'Select property...',
      unitNumber: 'Unit Number',
      area: 'Area (sq yds)',
      totalCost: 'Total Cost (₹)',
      bookingDate: 'Booking Date',
      cancel: 'Cancel',
      saveAllotment: 'Save Allotment',
    };
    return map[key] || key;
  },
}));

const mockProfiles: ProfileSummary[] = [
  { id: 'prof-1', full_name: 'Anita Verma', email: 'anita@example.com' },
];

const mockProperties: PropertySummary[] = [
  { id: 'prop-1', name: 'Shyam Aangan Farm House', active: true },
];

const defaultFormData: AllotmentFormData = {
  profile_id: 'prof-1',
  property_id: 'prop-1',
  unit_number: 'Plot-101',
  area: '200',
  total_cost: '5000000',
  booking_date: '2026-04-01',
};

describe('PortalAllotmentFormModal', () => {
  it('renders modal inputs and options for new allotment', () => {
    render(
      <PortalAllotmentFormModal
        isOpen={true}
        onClose={vi.fn()}
        editingId={null}
        formData={defaultFormData}
        setFormData={vi.fn()}
        profiles={mockProfiles}
        properties={mockProperties}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('New Allotment');
    expect(screen.getByText('Anita Verma (anita@example.com)')).toBeDefined();
    expect(screen.getByText('Shyam Aangan Farm House')).toBeDefined();
    expect(screen.getByDisplayValue('Plot-101')).toBeDefined();
    expect(screen.getByDisplayValue('200')).toBeDefined();
    expect(screen.getByDisplayValue('5000000')).toBeDefined();
    expect(screen.getByDisplayValue('2026-04-01')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Save Allotment' })).toBeDefined();
  });

  it('renders "Edit Allotment" title when editingId is provided', () => {
    render(
      <PortalAllotmentFormModal
        isOpen={true}
        onClose={vi.fn()}
        editingId="allot-1"
        formData={defaultFormData}
        setFormData={vi.fn()}
        profiles={mockProfiles}
        properties={mockProperties}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Edit Allotment');
  });

  it('submits form via onSave callback', () => {
    const handleSave = vi.fn((e) => e.preventDefault());
    render(
      <PortalAllotmentFormModal
        isOpen={true}
        onClose={vi.fn()}
        editingId={null}
        formData={defaultFormData}
        setFormData={vi.fn()}
        profiles={mockProfiles}
        properties={mockProperties}
        onSave={handleSave}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Save Allotment' });
    fireEvent.click(submitBtn);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('closes modal when Cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <PortalAllotmentFormModal
        isOpen={true}
        onClose={handleClose}
        editingId={null}
        formData={defaultFormData}
        setFormData={vi.fn()}
        profiles={mockProfiles}
        properties={mockProperties}
        onSave={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <PortalAllotmentFormModal
        isOpen={false}
        onClose={vi.fn()}
        editingId={null}
        formData={defaultFormData}
        setFormData={vi.fn()}
        profiles={mockProfiles}
        properties={mockProperties}
        onSave={vi.fn()}
      />
    );

    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });
});
