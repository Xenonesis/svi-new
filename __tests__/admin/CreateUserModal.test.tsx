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

  it('automatically populates SVI Email Address when Full Name is typed and keeps it read-only', () => {
    render(
      <CreateUserModal
        token="test-token"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        properties={[{ name: 'Shivani Vatika', slug: 'shivani-vatika' }]}
      />
    );

    const nameInput = screen.getByPlaceholderText('Rajesh Kumar');
    const sviEmailInput = screen.getByPlaceholderText(
      'Auto-generated from name...'
    ) as HTMLInputElement;

    expect(sviEmailInput.value).toBe('');
    expect(sviEmailInput.readOnly).toBe(true);

    fireEvent.change(nameInput, { target: { value: 'Aman Sharma' } });
    expect(sviEmailInput.value).toBe('aman.sharma@sviinfra.com');
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

  it('automatically adopts suggested SVI email when unique check returns collision resolution', async () => {
    mockFetch.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        email_available: false,
        email_error: null,
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

    const nameInput = screen.getByPlaceholderText('Rajesh Kumar');
    const sviEmailInput = screen.getByPlaceholderText(
      'Auto-generated from name...'
    ) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Wasi Haider' } });

    await waitFor(
      () => {
        expect(sviEmailInput.value).toBe('wasi.haider2@sviinfra.com');
      },
      { timeout: 3000 }
    );
  });
});
