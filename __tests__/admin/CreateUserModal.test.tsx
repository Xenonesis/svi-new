import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateUserModal } from '@/src/components/admin/modals/CreateUserModal';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('CreateUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        email_available: true,
        real_email_available: true,
        phone_available: true,
        suggested_svi_email: 'rajesh.kumar@sviinfra.com',
      }),
    }));
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

  it('generates a strong random password on clicking Generate button', () => {
    render(
      <CreateUserModal
        token="test-token"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        properties={[{ name: 'Shivani Vatika', slug: 'shivani-vatika' }]}
      />
    );

    const passInput = screen.getByPlaceholderText('Min 8 chars') as HTMLInputElement;
    expect(passInput.value).toBe('');

    const generateBtn = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateBtn);

    expect(passInput.value.length).toBeGreaterThanOrEqual(12);
  });

  it('handles Select All and Clear for property interests', () => {
    render(
      <CreateUserModal
        token="test-token"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        properties={[
          { name: 'Shivani Vatika', slug: 'shivani-vatika' },
          { name: 'Shyam Aangan', slug: 'shyam-aangan' },
        ]}
      />
    );

    const selectAllBtn = screen.getByRole('button', { name: /select all/i });
    fireEvent.click(selectAllBtn);

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    checkboxes.forEach((cb) => expect(cb.checked).toBe(true));

    const clearBtn = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearBtn);
    checkboxes.forEach((cb) => expect(cb.checked).toBe(false));
  });

  it('appends quick tags to internal notes', () => {
    render(
      <CreateUserModal
        token="test-token"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        properties={[{ name: 'Shivani Vatika', slug: 'shivani-vatika' }]}
      />
    );

    const notesTextarea = screen.getByPlaceholderText(
      'Internal notes about this client...'
    ) as HTMLTextAreaElement;
    expect(notesTextarea.value).toBe('');

    const siteVisitTag = screen.getByRole('button', { name: /\+ Site visit scheduled/i });
    fireEvent.click(siteVisitTag);

    expect(notesTextarea.value).toContain('Site visit scheduled');
  });

  it('displays suggested SVI email chip on duplicate conflict and allows 1-click apply', async () => {
    mockFetch.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        email_available: false,
        email_error: 'An account with SVI email "wasi.haider@sviinfra.com" already exists.',
        real_email_available: true,
        phone_available: true,
        suggested_svi_email: 'wasi.haider2@sviinfra.com',
      }),
    }));

    render(
      <CreateUserModal
        token="test-token"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        properties={[{ name: 'Shivani Vatika', slug: 'shivani-vatika' }]}
      />
    );

    const sviEmailInput = screen.getByPlaceholderText('client@sviinfra.com') as HTMLInputElement;

    // Manually type the email first (setting isEmailManualRef = true)
    fireEvent.change(sviEmailInput, { target: { value: 'wasi.haider@sviinfra.com' } });

    await waitFor(
      () => {
        expect(screen.getByText(/An account with SVI email/i)).toBeDefined();
        expect(screen.getByText(/wasi.haider2@sviinfra.com/i)).toBeDefined();
      },
      { timeout: 3000 }
    );

    const useThisBtn = screen.getByRole('button', { name: /use this/i });
    expect(useThisBtn).toBeDefined();

    fireEvent.click(useThisBtn);
    expect(sviEmailInput.value).toBe('wasi.haider2@sviinfra.com');
  });
});
