import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { useLoginForm } from '@/src/components/auth/useLoginForm';
import { LoginMethodTabs } from '@/src/components/auth/LoginMethodTabs';
import { LoginFormPassword } from '@/src/components/auth/LoginFormPassword';
import { LoginFormOtp } from '@/src/components/auth/LoginFormOtp';
import { LoginSuccessCard } from '@/src/components/auth/LoginSuccessCard';

// Mocks
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, string>) => {
      if (params?.email) return `Check your inbox at ${params.email}`;
      return key;
    };
    return t;
  },
}));

const mockSignInWithPassword = vi.fn();
const mockSignInWithOtp = vi.fn();
const mockVerifyOtp = vi.fn();
const mockSignOut = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('useLoginForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.loginMethod).toBe('password');
    expect(result.current.identifier).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.otpSent).toBe(false);
    expect(result.current.otp).toBe('');
    expect(result.current.success).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.identifierIsValid).toBe(true);
    expect(result.current.passwordIsValid).toBe(true);
    expect(result.current.otpIsValid).toBe(true);
  });

  it('switches login method and resets errors and touched state', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setError('Some error');
      result.current.setOtpSent(true);
      result.current.setIdentifierTouched(true);
      result.current.switchMethod('otp');
    });

    expect(result.current.loginMethod).toBe('otp');
    expect(result.current.error).toBe('');
    expect(result.current.otpSent).toBe(false);
    expect(result.current.identifierTouched).toBe(false);
  });

  it('validates identifier and password for password login', async () => {
    const { result } = renderHook(() => useLoginForm());

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;

    // Empty email
    await act(async () => {
      await result.current.handlePasswordLogin(fakeEvent);
    });

    expect(result.current.error).toBe('validation.emailRequired');
    expect(result.current.shake).toBe(true);

    // Invalid email
    act(() => {
      result.current.setIdentifier('not-an-email');
    });

    await act(async () => {
      await result.current.handlePasswordLogin(fakeEvent);
    });

    expect(result.current.error).toBe('validation.emailRequired');

    // Valid email, short password
    act(() => {
      result.current.setIdentifier('user@example.com');
      result.current.setPassword('123');
    });

    await act(async () => {
      await result.current.handlePasswordLogin(fakeEvent);
    });

    expect(result.current.error).toBe('validation.passwordRequired');
  });

  it('handles successful password login for customer', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { id: 'user-123', is_active: true, role: 'customer' },
              error: null,
            }),
        }),
      }),
    });

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setIdentifier('client@example.com');
      result.current.setPassword('secret123');
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handlePasswordLogin(fakeEvent);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.error).toBe('');

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(mockPush).toHaveBeenCalledWith('/portal/dashboard');
  });

  it('handles successful password login for admin', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { id: 'admin-123', is_active: true, role: 'admin' },
              error: null,
            }),
        }),
      }),
    });

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setIdentifier('admin@example.com');
      result.current.setPassword('secret123');
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handlePasswordLogin(fakeEvent);
    });

    expect(result.current.success).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('rejects deactivated account during password login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'deactivated-123' } },
      error: null,
    });

    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { id: 'deactivated-123', is_active: false, role: 'customer' },
              error: null,
            }),
        }),
      }),
    });

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setIdentifier('blocked@example.com');
      result.current.setPassword('secret123');
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handlePasswordLogin(fakeEvent);
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.error).toBe(
      'Your account has been deactivated. Please contact the administrator.'
    );
    expect(result.current.success).toBe(false);
  });

  it('handles send OTP and verify OTP workflows', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null });

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setIdentifier('otpuser@example.com');
    });

    await act(async () => {
      await result.current.handleSendOtp();
    });

    expect(mockSignInWithOtp).toHaveBeenCalledWith({ email: 'otpuser@example.com' });
    expect(result.current.otpSent).toBe(true);

    // Verify OTP
    mockVerifyOtp.mockResolvedValueOnce({
      data: { user: { id: 'otp-verified-1' } },
      error: null,
    });

    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { role: 'customer' },
              error: null,
            }),
        }),
      }),
    });

    act(() => {
      result.current.setOtp('123456');
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleOtpVerify(fakeEvent);
    });

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      email: 'otpuser@example.com',
      token: '123456',
      type: 'email',
    });
    expect(result.current.success).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(mockPush).toHaveBeenCalledWith('/portal/dashboard');
  });
});

describe('LoginMethodTabs Component', () => {
  it('renders tabs and triggers onSelectMethod', () => {
    const onSelect = vi.fn();
    render(<LoginMethodTabs loginMethod="password" onSelectMethod={onSelect} />);

    expect(screen.getByText('passwordTab')).toBeDefined();
    expect(screen.getByText('otpTab')).toBeDefined();

    fireEvent.click(screen.getByText('otpTab'));
    expect(onSelect).toHaveBeenCalledWith('otp');
  });
});

describe('LoginFormPassword Component', () => {
  it('renders inputs, handles toggle password visibility, and triggers submit', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const onForgot = vi.fn();
    const setIdentifier = vi.fn();
    const setPassword = vi.fn();
    const setShowPassword = vi.fn();

    const { rerender } = render(
      <LoginFormPassword
        identifier="test@example.com"
        setIdentifier={setIdentifier}
        identifierTouched={false}
        setIdentifierTouched={vi.fn()}
        showIdentifierError={false}
        password="secretpassword"
        setPassword={setPassword}
        passwordTouched={false}
        setPasswordTouched={vi.fn()}
        showPasswordError={false}
        showPassword={false}
        setShowPassword={setShowPassword}
        isSubmitting={false}
        onSubmit={onSubmit}
        onForgotPassword={onForgot}
      />
    );

    expect(screen.getByPlaceholderText('emailPlaceholder')).toBeDefined();
    const passwordInput = screen.getByPlaceholderText('passwordPlaceholder');
    expect(passwordInput.getAttribute('type')).toBe('password');

    // Toggle button
    const toggleBtn = screen.getByLabelText('Show password');
    fireEvent.click(toggleBtn);
    expect(setShowPassword).toHaveBeenCalled();

    // Forgot password button
    const forgotBtn = screen.getByText('Forgot password?');
    fireEvent.click(forgotBtn);
    expect(onForgot).toHaveBeenCalled();

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /loginButton/i });
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();

    // Rerender with showPassword = true
    rerender(
      <LoginFormPassword
        identifier="test@example.com"
        setIdentifier={setIdentifier}
        identifierTouched={false}
        setIdentifierTouched={vi.fn()}
        showIdentifierError={false}
        password="secretpassword"
        setPassword={setPassword}
        passwordTouched={false}
        setPasswordTouched={vi.fn()}
        showPasswordError={false}
        showPassword={true}
        setShowPassword={setShowPassword}
        isSubmitting={false}
        onSubmit={onSubmit}
        onForgotPassword={onForgot}
      />
    );

    const updatedPasswordInput = screen.getByPlaceholderText('passwordPlaceholder');
    expect(updatedPasswordInput.getAttribute('type')).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeDefined();
  });
});

describe('LoginFormOtp Component', () => {
  it('renders initial send otp state and verification stage', () => {
    const onSendOtp = vi.fn();
    const onVerifyOtp = vi.fn((e) => e.preventDefault());
    const onResetOtp = vi.fn();

    const { rerender } = render(
      <LoginFormOtp
        identifier="otp@example.com"
        setIdentifier={vi.fn()}
        identifierTouched={false}
        setIdentifierTouched={vi.fn()}
        showIdentifierError={false}
        otpSent={false}
        otp=""
        setOtp={vi.fn()}
        otpTouched={false}
        setOtpTouched={vi.fn()}
        showOtpError={false}
        isSubmitting={false}
        onSendOtp={onSendOtp}
        onVerifyOtp={onVerifyOtp}
        onResetOtp={onResetOtp}
      />
    );

    const sendOtpBtn = screen.getByRole('button', { name: 'sendOtpButton' });
    fireEvent.click(sendOtpBtn);
    expect(onSendOtp).toHaveBeenCalled();

    // Rerender with otpSent = true
    rerender(
      <LoginFormOtp
        identifier="otp@example.com"
        setIdentifier={vi.fn()}
        identifierTouched={false}
        setIdentifierTouched={vi.fn()}
        showIdentifierError={false}
        otpSent={true}
        otp="123456"
        setOtp={vi.fn()}
        otpTouched={false}
        setOtpTouched={vi.fn()}
        showOtpError={false}
        isSubmitting={false}
        onSendOtp={onSendOtp}
        onVerifyOtp={onVerifyOtp}
        onResetOtp={onResetOtp}
      />
    );

    expect(screen.getByPlaceholderText('otpPlaceholder')).toBeDefined();
    expect(screen.getByText('Check your inbox at otp@example.com')).toBeDefined();

    const changeEmailBtn = screen.getByText('changeEmail');
    fireEvent.click(changeEmailBtn);
    expect(onResetOtp).toHaveBeenCalled();

    const verifyBtn = screen.getByRole('button', { name: /verifyButton/i });
    fireEvent.click(verifyBtn);
    expect(onVerifyOtp).toHaveBeenCalled();
  });
});

describe('LoginSuccessCard Component', () => {
  it('renders welcome back message and auth success indicator', () => {
    render(<LoginSuccessCard />);

    expect(screen.getByText('welcomeBack')).toBeDefined();
    expect(screen.getByText('authSuccess')).toBeDefined();
  });
});
