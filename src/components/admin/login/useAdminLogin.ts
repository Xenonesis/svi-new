'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthStore } from '@/src/stores/authStore';

export interface AdminLoginState {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPass: boolean;
  setShowPass: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  error: string;
  success: boolean;
  emailTouched: boolean;
  setEmailTouched: React.Dispatch<React.SetStateAction<boolean>>;
  passwordTouched: boolean;
  setPasswordTouched: React.Dispatch<React.SetStateAction<boolean>>;
  shake: boolean;
  setShake: React.Dispatch<React.SetStateAction<boolean>>;
  showEmailError: boolean;
  showPasswordError: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useAdminLogin(): AdminLoginState {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Field validation and touched states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shake, setShake] = useState(false);

  const emailIsValid = email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : true;
  const passwordIsValid = password ? password.length >= 6 : true;

  const showEmailError = emailTouched && !emailIsValid;
  const showPasswordError = passwordTouched && !passwordIsValid;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setEmailTouched(true);
    setPasswordTouched(true);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setShake(true);
      return;
    }

    // Validate password length
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setShake(true);
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        setError(authError?.message || 'Login failed. Please verify your credentials.');
        setShake(true);
        setLoading(false);
        return;
      }

      // Verify admin role server-side via profile lookup
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Admin login profile query error:', profileError);
      }
      if (profile?.is_active === false) {
        await supabase.auth.signOut();
        setError('Your account has been deactivated. Please contact the administrator.');
        setShake(true);
        setLoading(false);
        return;
      }

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setError('Access denied. This portal is for administrators only.');
        setShake(true);
        setLoading(false);
        return;
      }

      // Populate the auth store immediately so the dashboard never waits on a second auth check
      useAuthStore.setState({
        userId: data.user.id,
        token: data.session.access_token,
        loading: false,
        isAdmin: true,
        profile: {
          id: data.user.id,
          full_name: profile?.full_name ?? data.user.email ?? 'Admin',
          email: profile?.email ?? data.user.email ?? '',
          role: profile?.role ?? 'admin',
        },
      });

      // Show premium success overlay stage, then navigate quickly
      setSuccess(true);

      // Navigate shortly after so the success animation is visible
      setTimeout(() => {
        router.replace('/admin/dashboard');
      }, 450);
    } catch (err: unknown) {
      let message = 'Network error: Failed to connect to the authentication server.';
      if (err instanceof Error) {
        message = err.message;
      } else if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof err.message === 'string'
      ) {
        message = err.message;
      }
      setError(message);
      setShake(true);
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPass,
    setShowPass,
    loading,
    error,
    success,
    emailTouched,
    setEmailTouched,
    passwordTouched,
    setPasswordTouched,
    shake,
    setShake,
    showEmailError,
    showPasswordError,
    handleSubmit,
  };
}
