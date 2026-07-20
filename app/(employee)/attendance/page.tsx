'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Timer,
  LogIn,
  LogOut as LogOutIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

export default function EmployeeAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [status, setStatus] = useState<EmployeeLiveStatus['status']>('not_punched');
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    checkAuth();

    // Live clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (status === 'punched_in' && punchInTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - punchInTime.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, punchInTime]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/employee/login');
      return;
    }

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
    fetchStatus(session.access_token);
  };

  const fetchStatus = async (token: string) => {
    try {
      const res = await fetch('/api/employee/attendance/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.status) {
        setStatus(data.status.status);
        if (data.status.punch_in_time) setPunchInTime(new Date(data.status.punch_in_time));
        if (data.status.punch_out_time) setPunchOutTime(new Date(data.status.punch_out_time));
        if (data.status.total_hours) setTotalHours(data.status.total_hours);
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/employee/login');
  };

  const executePunch = async (type: 'in' | 'out') => {
    setActionLoading(true);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setActionLoading(false);
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error('Not authenticated');

          const endpoint =
            type === 'in'
              ? '/api/employee/attendance/punch-in'
              : '/api/employee/attendance/punch-out';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ lat: latitude, lon: longitude }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || `Punch ${type} failed`);
          }

          // Refresh status
          await fetchStatus(session.access_token);
        } catch (err: any) {
          setErrorMsg(err.message || `Failed to punch ${type}. Please try again.`);
        } finally {
          setActionLoading(false);
        }
      },
      (err) => {
        setActionLoading(false);
        setErrorMsg(
          `Unable to retrieve your location: ${err.message}. Please enable location permissions.`
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (loading || statusLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
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
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-gray-900 px-8 py-10 text-center text-white dark:bg-black/40">
            <h2 className="mb-1 text-sm font-medium tracking-widest text-gray-400 uppercase">
              {format(currentTime, 'EEEE, MMMM d')}
            </h2>
            <div className="font-mono text-5xl font-light tracking-tighter">
              {format(currentTime, 'HH:mm:ss')}
            </div>
          </div>

          <div className="space-y-6 p-8 text-center">
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-left text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {status === 'not_punched' && (
              <div>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  You haven't punched in yet today.
                </p>
                <button
                  onClick={() => executePunch('in')}
                  disabled={actionLoading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-6 py-5 font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-emerald-500/25 active:scale-95 disabled:opacity-70"
                >
                  <div className="flex items-center justify-center gap-2">
                    {actionLoading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <LogIn
                          size={20}
                          className="transition-transform group-hover:translate-x-1"
                        />
                        <span className="text-lg">Punch In</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}

            {status === 'punched_in' && (
              <div>
                <div className="mb-6 flex flex-col items-center justify-center">
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    Currently Working
                  </span>
                  <div className="font-mono text-3xl font-bold text-gray-900 dark:text-white">
                    {elapsedTime}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Punched in at {punchInTime && format(punchInTime, 'hh:mm a')}
                  </p>
                </div>

                <button
                  onClick={() => executePunch('out')}
                  disabled={actionLoading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-rose-600 px-6 py-5 font-bold text-white shadow-lg transition-all hover:bg-rose-700 hover:shadow-rose-500/25 active:scale-95 disabled:opacity-70"
                >
                  <div className="flex items-center justify-center gap-2">
                    {actionLoading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <LogOutIcon
                          size={20}
                          className="transition-transform group-hover:-translate-x-1"
                        />
                        <span className="text-lg">Punch Out</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}

            {status === 'punched_out' && (
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className="rounded-full bg-gray-100 p-4 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                    Shift Completed
                  </h3>
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    You have successfully punched out for today.
                  </p>
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-left dark:bg-gray-800/50">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Punch In
                      </p>
                      <p className="font-mono text-sm font-medium dark:text-gray-200">
                        {punchInTime && format(punchInTime, 'hh:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Punch Out
                      </p>
                      <p className="font-mono text-sm font-medium dark:text-gray-200">
                        {punchOutTime && format(punchOutTime, 'hh:mm a')}
                      </p>
                    </div>
                    <div className="col-span-2 mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Total Hours
                      </p>
                      <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {totalHours} hrs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
