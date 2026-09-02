import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateUserModal } from '@/src/components/admin/modals/CreateUserModal';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CreateUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        email_available: true,
        real_email_available: true,
        phone_available: true,
        suggested_svi_email: 'rajesh.kumar@sviinfra.com',
      }),
    });
  });

  it('automatically populates SVI Email Address when Full Name is typed', () => {
    render(
      <CreateUserModal
        token="test-token"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        properties={[{ name: 'Shivani Vatika', slug: 'shivani-vatika' }]}
      />
    );

    const nameInput = screen.getByPlaceholderText('Rajesh Kumar');
    const sviEmailInput = screen.getByPlaceholderText('client@sviinfra.com') as HTMLInputElement;

    expect(sviEmailInput.value).toBe('');

    fireEvent.change(nameInput, { target: { value: 'Aman Sharma' } });

    expect(sviEmailInput.value).toBe('aman.sharma@sviinfra.com');
  });

  it('allows manual override of SVI email and shows auto-sync button', () => {
    render(
      <CreateUserModal
        token="test-token"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        properties={[{ name: 'Shivani Vatika', slug: 'shivani-vatika' }]}
      />
    );

    const nameInput = screen.getByPlaceholderText('Rajesh Kumar');
    const sviEmailInput = screen.getByPlaceholderText('client@sviinfra.com') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Vikram Singh' } });
    expect(sviEmailInput.value).toBe('vikram.singh@sviinfra.com');

    // Manually edit the email
    fireEvent.change(sviEmailInput, { target: { value: 'custom.vikram@sviinfra.com' } });
    expect(sviEmailInput.value).toBe('custom.vikram@sviinfra.com');

    // "Auto" button appears
    const autoBtn = screen.getByRole('button', { name: /auto/i });
    expect(autoBtn).toBeDefined();

    // Clicking Auto button resets email to auto-generated from full name
    fireEvent.click(autoBtn);
    expect(sviEmailInput.value).toBe('vikram.singh@sviinfra.com');
  });
});
