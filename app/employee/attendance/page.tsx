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
  Calendar,
  Building,
  RefreshCw,
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
      if (res.ok) {
        const json = await res.json();
        if (json.status) {
          setStatusData({
            status: json.status.status || 'not_punched',
            punch_in_time: json.status.punch_in_time || null,
            punch_out_time: json.status.punch_out_time || null,
            total_hours: json.status.total_hours || null,
            is_late: !!json.status.is_late,
            is_geofence_verified: !!json.status.is_geofence_verified,
          });
        }
      }
    } catch {
      toast.error('Could not load live attendance status');
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
        console.warn('Geolocation error:', err.message);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (statusData.status === 'punched_in' && statusData.punch_in_time) {
        const start = new Date(statusData.punch_in_time);
        const diffSec = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);
        const seconds = diffSec % 60;
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [statusData]);

  const executePunch = async (type: 'in' | 'out') => {
    setPunching(true);
    try {
      let currentLat = coords?.lat;
      let currentLon = coords?.lon;

      // Try fresh GPS reading
      if (navigator.geolocation) {
        try {
          const freshPos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          });
          currentLat = freshPos.coords.latitude;
          currentLon = freshPos.coords.longitude;
          setCoords({ lat: currentLat, lon: currentLon });
          setLocationStatus('ready');
        } catch {
          // fallback to cached coordinates
        }
      }

      const endpoint =
        type === 'in' ? '/api/employee/attendance/punch-in' : '/api/employee/attendance/punch-out';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: currentLat,
          longitude: currentLon,
          accuracy: 10,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to punch attendance');
      }

      // Update state
      await fetchStatus();
      setShowWorkLogModal(false);

      // Auto-save work log if entered on punch-out
      if (type === 'out' && workSummary.trim()) {
        try {
          await fetch('/api/employee/work/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              summary_text: workSummary,
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
          ? 'Successfully Punched In! Have a productive shift.'
          : 'Successfully Punched Out! Shift summary recorded.'
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium text-slate-500">Checking attendance status...</p>
      </div>
    );
  }

  const isPunchedIn = statusData.status === 'punched_in';
  const isPunchedOut = statusData.status === 'punched_out';

  return (
    <div className="space-y-6 pb-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            GPS Attendance Terminal
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Geofence verified punch-in and shift tracker
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:self-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Main Terminal Card (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div
            className={clsx(
              'relative overflow-hidden rounded-3xl border p-6 text-center shadow-lg transition-all',
              isPunchedIn
                ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-white dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-slate-900'
                : isPunchedOut
                  ? 'border-blue-500/30 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-white dark:from-blue-950/30 dark:via-slate-900/60 dark:to-slate-900'
                  : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/70'
            )}
          >
            {/* Live Status Badge */}
            <div className="mb-6 flex items-center justify-between">
              <span
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase',
                  isPunchedIn
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : isPunchedOut
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                <div
                  className={clsx(
                    'h-2 w-2 rounded-full',
                    isPunchedIn
                      ? 'animate-pulse bg-emerald-500'
                      : isPunchedOut
                        ? 'bg-blue-500'
                        : 'bg-slate-400'
                  )}
                />
                {isPunchedIn ? 'Shift Active' : isPunchedOut ? 'Shift Ended' : 'Not Punched'}
              </span>

              {statusData.is_late && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Late Arrival
                </span>
              )}
            </div>

            {/* Shift Timer Radial */}
            <div className="relative mx-auto my-6 flex h-48 w-48 items-center justify-center rounded-full border-8 border-slate-100 bg-slate-50/80 shadow-inner dark:border-slate-800 dark:bg-slate-950/80">
              {isPunchedIn && (
                <div className="absolute inset-0 animate-spin rounded-full border-8 border-emerald-500 border-t-transparent" />
              )}
              <div className="flex flex-col items-center">
                <Clock
                  className={clsx(
                    'h-8 w-8',
                    isPunchedIn
                      ? 'text-emerald-500'
                      : isPunchedOut
                        ? 'text-blue-500'
                        : 'text-slate-400'
                  )}
                />
                <span className="mt-2 font-mono text-2xl font-black text-slate-900 dark:text-white">
                  {isPunchedIn
                    ? elapsedTime
                    : isPunchedOut
                      ? `${(statusData.total_hours || 0).toFixed(1)} hrs`
                      : '00:00:00'}
                </span>
                <span className="mt-0.5 text-xs text-slate-500">
                  {isPunchedIn
                    ? 'Live Shift Elapsed'
                    : isPunchedOut
                      ? 'Total Shift Time'
                      : 'Ready to Punch'}
                </span>
              </div>
            </div>

            {/* Time Stamp Summary */}
            <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left dark:border-slate-800 dark:bg-slate-950/40">
              <div>
                <span className="text-[10px] text-slate-400">Punch In Time</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {statusData.punch_in_time
                    ? format(new Date(statusData.punch_in_time), 'hh:mm:ss a')
                    : '--:--'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Punch Out Time</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {statusData.punch_out_time
                    ? format(new Date(statusData.punch_out_time), 'hh:mm:ss a')
                    : '--:--'}
                </p>
              </div>
            </div>

            {/* Punch Action Button */}
            {!isPunchedIn ? (
              <button
                onClick={() => executePunch('in')}
                disabled={punching}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 disabled:opacity-50"
              >
                {punching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>{isPunchedOut ? 'Punch In Again' : 'Punch In (Start Shift)'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handlePunchOutClick}
                disabled={punching}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-500 disabled:opacity-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Punch Out (End Shift)</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: GPS Details & Shift Guidelines (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* GPS Geofence Verification Status */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    GPS Geofence Verification
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time coordinate verification for office and site locations
                  </p>
                </div>
              </div>

              <span
                className={clsx(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                  locationStatus === 'ready'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : locationStatus === 'acquiring'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-red-500/15 text-red-600 dark:text-red-400'
                )}
              >
                {locationStatus === 'ready'
                  ? 'GPS Locked'
                  : locationStatus === 'acquiring'
                    ? 'Acquiring GPS...'
                    : 'Location Denied'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span>Device Coordinates</span>
                </div>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : 'Scanning...'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Geofence State</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {statusData.is_geofence_verified
                    ? 'Verified within Office Bounds'
                    : 'Auto Geofenced'}
                </p>
              </div>
            </div>
          </div>

          {/* Shift Guidelines & Company Rules */}
          <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Shift Guidelines & Timing Rules
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Official Shift Window</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  09:00 AM – 06:00 PM
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>Late Arrival Threshold</span>
                </div>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  After 09:30 AM
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building className="h-4 w-4 text-emerald-500" />
                  <span>Geofenced Base Locations</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  SVI Head Office & Sites
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Info className="h-4 w-4 text-purple-500" />
                  <span>Missed a Punch?</span>
                </div>
                <a
                  href="/employee/attendance/history"
                  className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Apply for Regularization →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Summary Modal on Punch-Out */}
      <AnimatePresence>
        {showWorkLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Shift Punch Out Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Wrap up today&apos;s shift with a quick work log
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Today&apos;s Work Highlights (Optional)
                  </label>
                  <textarea
                    value={workSummary}
                    onChange={(e) => setWorkSummary(e.target.value)}
                    placeholder="Briefly describe what you completed today..."
                    rows={3}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Client Calls / Interactions
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={clientCount}
                      onChange={(e) => setClientCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Site Visits Conducted
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={visitCount}
                      onChange={(e) => setVisitCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowWorkLogModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executePunch('out')}
                  disabled={punching}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
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
