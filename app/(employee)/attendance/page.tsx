'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { MapPin, Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeeAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'checking_in' | 'success' | 'error'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/employee/login');
      return;
    }

    // Check if employee role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'employee') {
      router.replace('/employee/login');
      return;
    }

    setUser(profile);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/employee/login');
  };

  const handleCheckIn = () => {
    setStatus('locating');
    setErrorMsg('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setStatus('checking_in');
          const { latitude, longitude } = position.coords;

          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error('Not authenticated');

          const res = await fetch('/api/employee/attendance/check-in', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              lat: latitude,
              lon: longitude,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Check-in failed');
          }

          setSuccessData(data);
          setStatus('success');
        } catch (err: any) {
          setStatus('error');
          setErrorMsg(err.message || 'Failed to check in. Please try again.');
        }
      },
      (err) => {
        setStatus('error');
        setErrorMsg(
          `Unable to retrieve your location: ${err.message}. Please enable location permissions.`
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Clock size={18} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">Attendance</h1>
            <p className="text-xs text-gray-500">{user?.full_name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-6 p-8 text-center">
            <h2 className="text-brand-navy font-serif text-2xl dark:text-white">
              {format(new Date(), 'EEEE, MMMM d')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please share your location to mark your attendance for today.
            </p>

            {status === 'idle' || status === 'error' ? (
              <button
                onClick={handleCheckIn}
                className="group relative w-full overflow-hidden rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-emerald-500/25 active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <MapPin size={20} className="group-hover:animate-bounce" />
                  <span>Mark Attendance</span>
                </div>
              </button>
            ) : null}

            {(status === 'locating' || status === 'checking_in') && (
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20"></div>
                  <div className="relative rounded-full bg-emerald-100 p-4 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <MapPin size={32} className="animate-pulse" />
                  </div>
                </div>
                <p className="animate-pulse font-medium text-emerald-600 dark:text-emerald-400">
                  {status === 'locating' ? 'Acquiring GPS location...' : 'Verifying geofence...'}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div className="rounded-full bg-emerald-100 p-4 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Check-in Complete
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your attendance has been recorded and sent for approval.
                  </p>
                  {successData?.geofence?.verified ? (
                    <div className="mt-4 flex inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/20">
                      <MapPin size={14} /> Geofence Verified
                    </div>
                  ) : (
                    <div className="mt-4 flex inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600 dark:bg-amber-900/20">
                      <AlertCircle size={14} /> Out of Range. Flagged for Admin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-left text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
