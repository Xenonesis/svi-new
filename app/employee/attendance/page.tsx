'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  LogIn,
  FileText,
  ShieldCheck,
  Navigation,
  Sparkles,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface StatusState {
  status: 'not_punched' | 'punched_in' | 'punched_out';
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
}

export default function EmployeeAttendancePunchPage() {
  const [statusData, setStatusData] = useState<StatusState>({
    status: 'not_punched',
    punch_in_time: null,
    punch_out_time: null,
    total_hours: null,
    is_late: false,
    is_geofence_verified: false,
  });

  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [locationStatus, setLocationStatus] = useState<'acquiring' | 'ready' | 'error'>(
    'acquiring'
  );
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Work Log Modal on Punch-out
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [workSummary, setWorkSummary] = useState('');
  const [clientCount, setClientCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/attendance/status');
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      if (data.status) {
        setStatusData({
          status: data.status.status,
          punch_in_time: data.status.punch_in_time,
          punch_out_time: data.status.punch_out_time,
          total_hours: data.status.total_hours,
          is_late: data.status.is_late || false,
          is_geofence_verified: data.status.is_geofence_verified || false,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch attendance status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // GPS Geolocation Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setLocationStatus('ready');
      },
      (err) => {
        console.warn('Geolocation warning:', err);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (statusData.status === 'punched_in' && statusData.punch_in_time) {
        const inTime = new Date(statusData.punch_in_time);
        const diffMs = Math.max(0, now.getTime() - inTime.getTime());
        const totalSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [statusData]);

  const executePunch = async (type: 'in' | 'out') => {
    setPunching(true);

    try {
      // Get fresh coordinates if possible
      let currentLat = coords?.lat;
      let currentLon = coords?.lon;

      if (navigator.geolocation) {
        try {
          const freshPos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
            });
          });
          currentLat = freshPos.coords.latitude;
          currentLon = freshPos.coords.longitude;
        } catch {
          // fallback to cached coords
        }
      }

      const endpoint =
        type === 'in' ? '/api/employee/attendance/punch-in' : '/api/employee/attendance/punch-out';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: currentLat ?? 0,
          lon: currentLon ?? 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Punch operation failed');
      }

      // If punching out and work summary was entered, submit work log
      if (type === 'out' && workSummary.trim()) {
        try {
          await fetch('/api/employee/work/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              summary: workSummary.trim(),
              client_interactions_count: clientCount,
              site_visits_conducted_count: visitCount,
            }),
          });
        } catch (e) {
          console.error('Failed to auto-save work log:', e);
        }
      }

      toast.success(
        type === 'in'
          ? 'Successfully Punched In! Have a great shift.'
          : 'Successfully Punched Out! Shift recorded.'
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Punch failed. Please check location permissions.';
      toast.error(message);
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOutClick = () => {
    setShowWorkLogModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium text-slate-500">Checking attendance status...</p>
      </div>
    );
  }

  const isPunchedIn = statusData.status === 'punched_in';
  const isPunchedOut = statusData.status === 'punched_out';

  return (
    <div className="space-y-6 pb-6">
      {/* Title & Date */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Attendance Terminal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {format(currentTime, 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Geofence Radar Status Badge */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              locationStatus === 'ready'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            )}
          >
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {locationStatus === 'ready' ? 'GPS Location Calibrated' : 'Acquiring GPS Fix'}
            </p>
            <p className="text-[10px] text-slate-500">
              {coords
                ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                : 'Waiting for device sensor...'}
            </p>
          </div>
        </div>

        <span
          className={clsx(
            'rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
            locationStatus === 'ready'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          )}
        >
          {locationStatus === 'ready' ? 'Active' : 'Searching'}
        </span>
      </div>

      {/* Big Circular Punch Radar Button */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center">
          {/* Animated Pulsing Rings */}
          {isPunchedIn && (
            <>
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute h-56 w-56 rounded-full bg-emerald-500/20"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute h-48 w-48 rounded-full bg-emerald-500/30"
              />
            </>
          )}

          {/* Main Button */}
          <button
            onClick={() => {
              if (isPunchedIn) {
                handlePunchOutClick();
              } else if (!isPunchedOut) {
                executePunch('in');
              }
            }}
            disabled={punching || isPunchedOut}
            className={clsx(
              'relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60',
              isPunchedIn
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700'
                : isPunchedOut
                  ? 'bg-slate-800 text-slate-400 shadow-none'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500'
            )}
          >
            {punching ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : isPunchedIn ? (
              <>
                <LogOut className="mb-1 h-9 w-9 stroke-[2.2]" />
                <span className="text-sm font-black tracking-wider uppercase">Punch Out</span>
                <span className="mt-0.5 text-[10px] opacity-80">End Today’s Shift</span>
              </>
            ) : isPunchedOut ? (
              <>
                <CheckCircle2 className="mb-1 h-9 w-9 text-emerald-400" />
                <span className="text-xs font-bold tracking-wider uppercase">Completed</span>
                <span className="mt-0.5 text-[10px] text-slate-400">Shift Logged</span>
              </>
            ) : (
              <>
                <LogIn className="mb-1 h-9 w-9 stroke-[2.2]" />
                <span className="text-sm font-black tracking-wider uppercase">Punch In</span>
                <span className="mt-0.5 text-[10px] opacity-80">Start Today’s Shift</span>
              </>
            )}
          </button>
        </div>

        {/* Current Time / Shift Timer Display */}
        <div className="mt-6 text-center">
          {isPunchedIn ? (
            <div>
              <p className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                Shift Elapsed Time
              </p>
              <div className="mt-1 font-mono text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {elapsedTime}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Terminal Time
              </p>
              <div className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {format(currentTime, 'hh:mm:ss a')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Today's Log Summary Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Today’s Timeline
        </h3>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="text-[11px] font-medium text-slate-500">Punch In</span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
              {statusData.punch_in_time
                ? format(new Date(statusData.punch_in_time), 'hh:mm a')
                : '--:--'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="text-[11px] font-medium text-slate-500">Punch Out</span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
              {statusData.punch_out_time
                ? format(new Date(statusData.punch_out_time), 'hh:mm a')
                : '--:--'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="text-[11px] font-medium text-slate-500">Total Hours</span>
            <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
              {statusData.total_hours
                ? `${statusData.total_hours}h`
                : isPunchedIn
                  ? 'Counting...'
                  : '--'}
            </p>
          </div>
        </div>

        {statusData.is_late && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Marked late arrival past regular cutoff window.</span>
          </div>
        )}
      </div>

      {/* Work Summary Modal on Punch-Out */}
      <AnimatePresence>
        {showWorkLogModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daily Shift Work Summary
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Summarize what you accomplished today before punching out
                  </p>
                </div>
              </div>

              <div className="my-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tasks / Work Done Today
                  </label>
                  <textarea
                    rows={3}
                    value={workSummary}
                    onChange={(e) => setWorkSummary(e.target.value)}
                    placeholder="e.g. Conducted 2 client meetings for Green Meadows, completed BBA reviews..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Client Calls / Interactions
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={clientCount}
                      onChange={(e) => setClientCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Site Visits Conducted
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={visitCount}
                      onChange={(e) => setVisitCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowWorkLogModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executePunch('out')}
                  disabled={punching}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-amber-500"
                >
                  {punching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & Punch Out'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
