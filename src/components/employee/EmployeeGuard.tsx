'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { ShieldAlert } from 'lucide-react';
import { BrandedLoadingState } from './BrandedLoadingState';

interface EmployeeGuardProps {
  children: React.ReactNode;
}

export default function EmployeeGuard({ children }: EmployeeGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // If on login page, skip guard checks
    if (pathname === '/employee/login') {
      setLoading(false);
      setAuthorized(true);
      return;
    }

    let isMounted = true;

    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            router.replace('/employee/login');
          }
          return;
        }

        // Fetch profile role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          if (isMounted) {
            router.replace('/employee/login');
          }
          return;
        }

        if (profile.role === 'employee' || profile.role === 'admin') {
          if (isMounted) {
            setAuthorized(true);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setAuthorized(false);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('EmployeeGuard check error:', err);
        if (isMounted) {
          router.replace('/employee/login');
        }
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/employee/login') {
        router.replace('/employee/login');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <BrandedLoadingState
        fullScreen
        message="Loading SVI Workspace..."
        subMessage="Verifying staff credentials & security clearance"
      />
    );
  }

  if (!authorized && pathname !== '/employee/login') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="mt-2 max-w-xs text-sm text-slate-400">
          Your account is not assigned an employee or administrative role.
        </p>
        <button
          onClick={() => {
            supabase.auth.signOut().then(() => router.replace('/employee/login'));
          }}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500"
        >
          Sign In with Another Account
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
