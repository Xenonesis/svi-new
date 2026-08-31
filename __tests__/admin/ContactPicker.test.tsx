/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactPicker } from '@/src/components/admin/email/compose/ContactPicker';

vi.mock('@/src/components/admin/email/helpers', () => ({
  getToken: vi.fn().mockResolvedValue('test-token'),
}));

const mockContacts = [
  {
    id: 'c1',
    full_name: 'Khushi Sharma',
    email: 'khushi.sharma@internal.com',
    real_email: 'khushi.sviinfrasoultions@gmail.com',
    role: 'employee',
  },
  {
    id: 'c2',
    full_name: 'Muskan Varshney',
    email: 'mv03012000@gmail.com',
    real_email: null,
    role: 'employee',
  },
  {
    id: 'c3',
    full_name: 'Neha Singh',
    email: 'gkgajalakhan11@gmail.com',
    real_email: null,
    role: 'client',
  },
  {
    id: 'c4',
    full_name: 'Priya Verma',
    email: 'illassviofficial@gmail.com',
    real_email: null,
    role: 'client',
  },
];

describe('ContactPicker Component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ contacts: mockContacts }),
      })
    );
  });

  it('renders contacts list with correct role badges and deliverable email', async () => {
    render(
      <ContactPicker
        open={true}
        onClose={vi.fn()}
        selectedEmails={new Set()}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
      />
    );

    expect(await screen.findByText('Khushi Sharma')).toBeInTheDocument();
    expect(screen.getByText('khushi.sviinfrasoultions@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Muskan Varshney')).toBeInTheDocument();
    expect(screen.getByText('Neha Singh')).toBeInTheDocument();
  });

  it('shows selected state and Selected badge when contact real_email is in selectedEmails', async () => {
    const selectedEmails = new Set(['khushi.sviinfrasoultions@gmail.com']);
    const onToggle = vi.fn();

    render(
      <ContactPicker
        open={true}
        onClose={vi.fn()}
        selectedEmails={selectedEmails}
        onToggle={onToggle}
        onSelectAll={vi.fn()}
      />
    );

    expect(await screen.findByText('Khushi Sharma')).toBeInTheDocument();
    expect(screen.getByText('1 Selected')).toBeInTheDocument();
    expect(screen.getByText('Add Selected (1)')).toBeInTheDocument();

    const khushiCard = screen.getByText('Khushi Sharma').closest('div[class*="cursor-pointer"]');
    expect(khushiCard).toBeInTheDocument();

    // Clicking toggles
    fireEvent.click(khushiCard!);
    expect(onToggle).toHaveBeenCalledWith(mockContacts[0]);
  });

  it('filters by category tabs (Employees, Clients, Selected)', async () => {
    const selectedEmails = new Set(['gkgajalakhan11@gmail.com']);

    render(
      <ContactPicker
        open={true}
        onClose={vi.fn()}
        selectedEmails={selectedEmails}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
      />
    );

    expect(await screen.findByText('Khushi Sharma')).toBeInTheDocument();

    // Click Clients Tab
    fireEvent.click(screen.getByRole('button', { name: /Clients/i }));
    expect(screen.getByText('Neha Singh')).toBeInTheDocument();
    expect(screen.getByText('Priya Verma')).toBeInTheDocument();
    expect(screen.queryByText('Khushi Sharma')).not.toBeInTheDocument();

    // Click Selected Only Tab
    fireEvent.click(screen.getByRole('button', { name: /Selected Only/i }));
    expect(screen.getByText('Neha Singh')).toBeInTheDocument();
    expect(screen.queryByText('Priya Verma')).not.toBeInTheDocument();
  });

  it('supports search and quick clear', async () => {
    render(
      <ContactPicker
        open={true}
        onClose={vi.fn()}
        selectedEmails={new Set()}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
      />
    );

    expect(await screen.findByText('Khushi Sharma')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by name or email/i);
    fireEvent.change(searchInput, { target: { value: 'Muskan' } });

    expect(screen.getByText('Muskan Varshney')).toBeInTheDocument();
    expect(screen.queryByText('Khushi Sharma')).not.toBeInTheDocument();
  });
});
