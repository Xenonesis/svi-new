'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '@/src/lib/supabase/client';

export type LoginMethod = 'password' | 'otp';

export interface UseLoginFormReturn {
  isSubmitting: boolean;
  loginMethod: LoginMethod;
  setLoginMethod: (method: LoginMethod) => void;
  switchMethod: (method: LoginMethod) => void;
  identifier: string;
  setIdentifier: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: (val: string) => void;
  otpSent: boolean;
  setOtpSent: (val: boolean) => void;
  otp: string;
  setOtp: (val: string) => void;
  resetOtp: () => void;
  success: boolean;
  setSuccess: (val: boolean) => void;
  identifierTouched: boolean;
  setIdentifierTouched: (val: boolean) => void;
  passwordTouched: boolean;
  setPasswordTouched: (val: boolean) => void;
  otpTouched: boolean;
  setOtpTouched: (val: boolean) => void;
  shake: boolean;
  setShake: (val: boolean) => void;
  identifierIsValid: boolean;
  passwordIsValid: boolean;
  otpIsValid: boolean;
  showIdentifierError: boolean;
  showPasswordError: boolean;
  showOtpError: boolean;
  handlePasswordLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleSendOtp: () => Promise<void>;
  handleOtpVerify: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useLoginForm(): UseLoginFormReturn {
  const t = useTranslations('pages.login');
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation & touched states
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [shake, setShake] = useState(false);

  const identifierIsValid = identifier ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) : true;
  const passwordIsValid = password ? password.length >= 6 : true;
  const otpIsValid = otp ? /^\d{6}$/.test(otp) : true;

  const showIdentifierError = identifierTouched && !identifierIsValid;
  const showPasswordError = passwordTouched && !passwordIsValid;
  const showOtpError = otpTouched && !otpIsValid;

  const switchMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    setError('');
    setOtpSent(false);
    setIdentifierTouched(false);
    setPasswordTouched(false);
    setOtpTouched(false);
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtp('');
    setOtpTouched(false);
  };

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIdentifierTouched(true);
    setPasswordTouched(true);

    if (!identifier || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError(t('validation.emailRequired'));
      setShake(true);
      return;
    }

    if (!password || password.length < 6) {
      setError(t('validation.passwordRequired'));
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      if (authError) throw authError;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.is_active === false) {
          await supabase.auth.signOut();
          throw new Error('Your account has been deactivated. Please contact the administrator.');
        }

        const isAdmin = profile?.role === 'admin';
        setSuccess(true);
        setTimeout(() => {
          router.push(isAdmin ? '/admin/dashboard' : '/portal/dashboard');
        }, 1800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('validation.loginFailed'));
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setIdentifierTouched(true);

    if (!identifier || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError(t('validation.emailRequired'));
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: identifier,
      });
      if (otpError) throw otpError;
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('validation.sendOtpFailed'));
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setOtpTouched(true);

    if (!otp || !/^\d{6}$/.test(otp)) {
      setError(t('validation.otpRequired'));
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
        error: verifyError,
      } = await supabase.auth.verifyOtp({
        email: identifier,
        token: otp,
        type: 'email',
      });
      if (verifyError) throw verifyError;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        const isAdmin = profile?.role === 'admin';
        setSuccess(true);
        setTimeout(() => {
          router.push(isAdmin ? '/admin/dashboard' : '/portal/dashboard');
        }, 1800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('validation.otpFailed'));
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    loginMethod,
    setLoginMethod,
    switchMethod,
    identifier,
    setIdentifier,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    setError,
    otpSent,
    setOtpSent,
    otp,
    setOtp,
    resetOtp,
    success,
    setSuccess,
    identifierTouched,
    setIdentifierTouched,
    passwordTouched,
    setPasswordTouched,
    otpTouched,
    setOtpTouched,
    shake,
    setShake,
    identifierIsValid,
    passwordIsValid,
    otpIsValid,
    showIdentifierError,
    showPasswordError,
    showOtpError,
    handlePasswordLogin,
    handleSendOtp,
    handleOtpVerify,
  };
}
