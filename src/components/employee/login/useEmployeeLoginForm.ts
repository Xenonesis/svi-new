'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

export function useEmployeeLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.role === 'employee' || profile?.role === 'admin') {
            router.replace('/employee/dashboard');
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
    }
    checkExistingSession();
  }, [router]);

  const identifierIsValid = identifier
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())
    : true;
  const passwordIsValid = password ? password.length >= 6 : true;

  const showIdentifierError = identifierTouched && !identifierIsValid;
  const showPasswordError = passwordTouched && !passwordIsValid;

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIdentifierTouched(true);
    setPasswordTouched(true);

    const cleanIdentifier = identifier.trim().toLowerCase();

    if (!cleanIdentifier || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier)) {
      setError('Please enter a valid work email address.');
      setShake(true);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanIdentifier,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid email or password. Please verify your credentials.');
        }
        throw authError;
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user record found.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile fetch warning on login:', profileError);
      }

      if (profile?.is_active === false) {
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated. Please contact the administrator.');
      }

      if (profile?.role === 'client') {
        await supabase.auth.signOut();
        throw new Error(
          'This portal is strictly reserved for SVI Infra Employees & Staff. Client accounts must log in via the Client Portal.'
        );
      }

      setSuccess(true);
      toast.success(`Welcome, ${profile?.full_name || 'Employee'}`);

      setTimeout(() => {
        router.replace('/employee/dashboard');
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    setError,
    success,
    showPassword,
    setShowPassword,
    showHelpModal,
    setShowHelpModal,
    identifierTouched,
    setIdentifierTouched,
    passwordTouched,
    setPasswordTouched,
    shake,
    setShake,
    isSubmitting,
    showIdentifierError,
    showPasswordError,
    handlePasswordLogin,
  };
}
