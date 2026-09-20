import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordCard } from '@/src/components/employee/profile/ChangePasswordCard';

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'fake-jwt-token' } },
      }),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ChangePasswordCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders all form inputs and update button', () => {
    render(<ChangePasswordCard />);

    expect(screen.getByLabelText(/current or temporary password/i)).toBeDefined();
    expect(screen.getByLabelText(/^new password/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm new password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /update password/i })).toBeDefined();
  });

  it('disables submit button when passwords do not match or are too short', () => {
    render(<ChangePasswordCard />);

    const currentInput = screen.getByLabelText(/current or temporary password/i);
    const newInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(currentInput, { target: { value: 'OldPass123' } });
    fireEvent.change(newInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'different' } });

    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables submit button when valid matching passwords are typed', () => {
    render(<ChangePasswordCard />);

    const currentInput = screen.getByLabelText(/current or temporary password/i);
    const newInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(currentInput, { target: { value: 'OldPass123' } });
    fireEvent.change(newInput, { target: { value: 'NewSecurePass2026!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewSecurePass2026!' } });

    expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('submits password change payload to API and shows success', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Password updated successfully. Admin has been notified.',
      }),
    } as Response);

    render(<ChangePasswordCard />);

    const currentInput = screen.getByLabelText(/current or temporary password/i);
    const newInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(currentInput, { target: { value: 'KimdH45K%$' } });
    fireEvent.change(newInput, { target: { value: 'ShivamNewPass2026!' } });
    fireEvent.change(confirmInput, { target: { value: 'ShivamNewPass2026!' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/employee/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-jwt-token',
        },
        body: JSON.stringify({
          currentPassword: 'KimdH45K%$',
          newPassword: 'ShivamNewPass2026!',
          confirmPassword: 'ShivamNewPass2026!',
        }),
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/password updated successfully! admin has been notified/i)
      ).toBeDefined();
    });
  });

  it('displays API error message when password update fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Current password is incorrect',
      }),
    } as Response);

    render(<ChangePasswordCard />);

    const currentInput = screen.getByLabelText(/current or temporary password/i);
    const newInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(currentInput, { target: { value: 'WrongPass123' } });
    fireEvent.change(newInput, { target: { value: 'ValidPass2026!' } });
    fireEvent.change(confirmInput, { target: { value: 'ValidPass2026!' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect')).toBeDefined();
    });
  });

  it('toggles password visibility on eye button click', () => {
    render(<ChangePasswordCard />);

    const currentInput = screen.getByLabelText(
      /current or temporary password/i
    ) as HTMLInputElement;
    const toggleBtn = screen.getByLabelText(/show current password/i);

    expect(currentInput.type).toBe('password');
    fireEvent.click(toggleBtn);
    expect(currentInput.type).toBe('text');
    fireEvent.click(toggleBtn);
    expect(currentInput.type).toBe('password');
  });
});
