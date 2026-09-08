import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegistrationTable } from '@/src/components/admin/registrations/RegistrationTable';
import { DetailModal } from '@/src/components/admin/registrations/DetailModal';
import type { Registration } from '@/src/components/admin/registrations/types';

const mockReg: Registration = {
  id: 'reg-1',
  submission_id: 'SVI-001',
  name: 'Rahul',
  last_name: 'Sharma',
  email: 'rahul@test.com',
  phone: '9999999999',
  so_wo_do: null,
  preferred_date: null,
  aadhar_number: null,
  pan_number: null,
  photo_url: null,
  pan_card_file_url: null,
  state: 'UP',
  city: 'Lucknow',
  address: 'Test address, Lucknow',
  advisor_name: 'Advisor One',
  project: 'Project A',
  property_size: null,
  property_type: null,
  plot_preference: null,
  payment_plan: null,
  payment_mode: null,
  scheme_amount: null,
  property_interest: null,
  message: null,
  status: 'Pending',
  is_important: false,
  created_at: '2026-09-08T09:00:00Z',
};

describe('Registrations slice A motion & actions', () => {
  it('applies table-row-hover to table rows', () => {
    const { container } = render(
      <RegistrationTable
        registrations={[mockReg]}
        loading={false}
        hasFilters={false}
        hasSearch={false}
        total={1}
        page={1}
        hasMore={false}
        startItem={1}
        endItem={1}
        onStarToggle={vi.fn()}
        onStatusChange={vi.fn()}
        onView={vi.fn()}
        onDelete={vi.fn()}
        onClearFilters={vi.fn()}
        onPageChange={vi.fn()}
      />
    );
    const row = container.querySelector('tbody tr');
    expect(row?.className).toContain('table-row-hover');
  });

  it('pagination buttons have accessible labels', () => {
    render(
      <RegistrationTable
        registrations={[mockReg]}
        loading={false}
        hasFilters={false}
        hasSearch={false}
        total={1}
        page={1}
        hasMore={false}
        startItem={1}
        endItem={1}
        onStarToggle={vi.fn()}
        onStatusChange={vi.fn()}
        onView={vi.fn()}
        onDelete={vi.fn()}
        onClearFilters={vi.fn()}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDefined();
  });

  it('detail modal has Approve and Reject quick actions', () => {
    const onStatusChange = vi.fn();
    render(
      <DetailModal
        reg={mockReg}
        onClose={vi.fn()}
        onStatusChange={onStatusChange}
        onDelete={vi.fn()}
      />
    );
    const approve = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approve);
    expect(onStatusChange).toHaveBeenCalledWith('reg-1', 'Approved');
    const reject = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(reject);
    expect(onStatusChange).toHaveBeenCalledWith('reg-1', 'Rejected');
  });
});
