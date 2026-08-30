'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PunchTerminalWidget } from '@/src/components/employee/attendance/PunchTerminalWidget';
import { GeofenceStatusCard } from '@/src/components/employee/attendance/GeofenceStatusCard';
import { ShiftGuidelinesCard } from '@/src/components/employee/attendance/ShiftGuidelinesCard';
import { PunchOutWorkLogModal } from '@/src/components/employee/attendance/PunchOutWorkLogModal';
import {
  PunchFeedbackBanner,
  type FeedbackNotice,
} from '@/src/components/employee/attendance/PunchFeedbackBanner';
import { offlinePunchQueue, QueuedPunch } from '@/src/lib/attendance/offlinePunchQueue';
import {
  getDeviceCoordinates,
  watchDevicePosition,
  ensureLocationPermission,
  type LocationResult,
} from '@/src/lib/location/geolocationService';
import { BrandedLoadingState } from '@/src/components/employee/BrandedLoadingState';
interface StatusState {
  user_id?: string;
  full_name?: string;
  email?: string;
  team_name?: string;
  status: 'not_punched' | 'punched_in' | 'punched_out';
  record_status?: 'present' | 'half_day' | 'absent' | 'leave' | 'pending' | null;
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  notes?: string | null;
  summary_text?: string | null;
  client_interactions_count?: number;
  site_visits_conducted_count?: number;
}

interface AttendanceSettings {
  punch_in_start?: string;
  punch_in_late_after?: string;
  punch_in_cutoff?: string;
  punch_out_start?: string;
  punch_out_end?: string;
  min_hours_half_day?: number;
  min_hours_full_day?: number;
  geofence_radius_meters?: number;
}
interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
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

  const [settings, setSettings] = useState<AttendanceSettings>({
    punch_in_start: '09:00',
    punch_in_late_after: '09:15',
    punch_in_cutoff: '10:30',
    punch_out_start: '17:00',
    punch_out_end: '21:00',
    min_hours_half_day: 4,
    min_hours_full_day: 8,
    geofence_radius_meters: 200,
  });
  const [locations, setLocations] = useState<GeofenceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [locationStatus, setLocationStatus] = useState<'acquiring' | 'ready' | 'error'>(
    'acquiring'
  );
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Work Log Modal on Punch-out
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [workSummary, setWorkSummary] = useState('');
  const [clientCount, setClientCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [feedbackNotice, setFeedbackNotice] = useState<FeedbackNotice | null>(null);

  // Offline Punch Queue State
  const [offlineQueue, setOfflineQueue] = useState<QueuedPunch[]>([]);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);

  useEffect(() => {
    setOfflineQueue(offlinePunchQueue.getQueue());
    const unsubscribe = offlinePunchQueue.subscribe((queue) => {
      setOfflineQueue([...queue]);
    });
    return unsubscribe;
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/attendance/status');
      if (res.ok) {
        const json = await res.json();
        if (json.status) {
          setStatusData(json.status);
        }
        if (json.settings) {
          setSettings(json.settings);
        }
        if (json.locations) {
          setLocations(json.locations);
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

  const handleSyncOffline = useCallback(async () => {
    setIsSyncingOffline(true);
    try {
      const { synced, failed } = await offlinePunchQueue.syncPendingPunches();
      if (synced > 0) {
        toast.success(`Synced ${synced} offline punch${synced > 1 ? 'es' : ''}`);
        await fetchStatus();
      }
      if (failed > 0) {
        toast.error(`Failed to sync ${failed} offline punch${failed > 1 ? 'es' : ''}`);
      }
    } catch {
      toast.error('Sync failed', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsSyncingOffline(false);
    }
  }, [fetchStatus]);

  // Acquire Geolocation with Native Capacitor + Web fallback
  const requestLocation = useCallback(async () => {
    setLocationStatus('acquiring');
    try {
      await ensureLocationPermission();
      const loc: LocationResult = await getDeviceCoordinates({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      setCoords({
        lat: loc.latitude,
        lon: loc.longitude,
      });
      setAccuracy(loc.accuracy);
      setLocationStatus('ready');
    } catch (err: unknown) {
      console.warn('Geolocation acquisition warning:', err);
      setLocationStatus('error');
    }
  }, []);

  useEffect(() => {
    requestLocation();

    const cleanupWatcher = watchDevicePosition(
      (loc) => {
        setCoords({
          lat: loc.latitude,
          lon: loc.longitude,
        });
        setAccuracy(loc.accuracy);
        setLocationStatus('ready');
      },
      (err) => {
        console.warn('Live location watch tick warning:', err.message);
      }
    );

    return () => {
      cleanupWatcher();
    };
  }, [requestLocation]);
  // Live Timer ticker for Active Shift
  useEffect(() => {
    if (statusData.status === 'punched_in' && statusData.punch_in_time) {
      const updateElapsed = () => {
        const start = new Date(statusData.punch_in_time!).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - start);

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [statusData.status, statusData.punch_in_time]);

  const executePunch = async (type: 'in' | 'out') => {
    setPunching(true);
    let currentCoords = coords;
    try {
      if (!currentCoords) {
        try {
          const loc = await getDeviceCoordinates({
            enableHighAccuracy: true,
            timeout: 10000,
          });
          currentCoords = { lat: loc.latitude, lon: loc.longitude };
          setCoords(currentCoords);
          setAccuracy(loc.accuracy);
          setLocationStatus('ready');
        } catch {
          const notice: FeedbackNotice = {
            type: 'error',
            title: 'GPS Location Required',
            message:
              'We need your device location to verify that you are within the approved office work zone.',
            reason: 'Device Location permission was denied or signal timed out.',
            actionLabel: 'Allow GPS & Retry',
            onAction: () => executePunch(type),
            secondaryActionLabel: 'Refresh GPS',
            onSecondaryAction: () => requestLocation(),
          };
          setFeedbackNotice(notice);
          toast.error('Location coordinates required', {
            description: 'Please enable GPS location permission on your device.',
          });
          setPunching(false);
          return;
        }
      }
      if (!currentCoords) {
        const notice: FeedbackNotice = {
          type: 'error',
          title: 'Location Signal Missing',
          message: 'GPS coordinates could not be retrieved from your device.',
          reason: 'Location service returned null coordinates.',
          actionLabel: 'Detect Location',
          onAction: () => requestLocation(),
        };
        setFeedbackNotice(notice);
        toast.error('Location signal missing', {
          description: 'Please enable location permissions and tap Detect Location.',
        });
        setPunching(false);
        return;
      }

      // Offline detection before sending network request
      const isDeviceOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (isDeviceOffline) {
        offlinePunchQueue.enqueue({
          type,
          timestamp: new Date().toISOString(),
          coords: currentCoords,
          workSummary: type === 'out' ? workSummary : undefined,
          clientCount: type === 'out' ? clientCount : undefined,
          visitCount: type === 'out' ? visitCount : undefined,
        });

        toast.info(
          'You are currently offline. Your punch has been securely saved locally and will auto-sync once online.'
        );

        setFeedbackNotice({
          type: 'info',
          title: 'Offline Punch Saved Locally',
          message:
            'You are currently offline. Your punch has been securely saved locally and will auto-sync once online.',
          reason: 'No internet connection detected.',
          actionLabel: 'Sync Now',
          onAction: () => handleSyncOffline(),
        });

        if (type === 'out') {
          setShowWorkLogModal(false);
          setWorkSummary('');
          setClientCount(0);
          setVisitCount(0);
        }
        setPunching(false);
        return;
      }

      const endpoint =
        type === 'in' ? '/api/employee/attendance/punch-in' : '/api/employee/attendance/punch-out';

      // Send both lat/lon and latitude/longitude to guarantee compatibility
      const bodyPayload: Record<string, unknown> = {
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        latitude: currentCoords.lat,
        longitude: currentCoords.lon,
      };

      if (type === 'out') {
        bodyPayload.summary_text = workSummary;
        bodyPayload.client_interactions_count = clientCount;
        bodyPayload.site_visits_conducted_count = visitCount;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (res.ok) {
        const successMsg =
          data.message ||
          (type === 'in'
            ? 'Successfully punched in! Have a productive shift.'
            : 'Shift completed! Punch-out recorded.');

        setFeedbackNotice({
          type: 'success',
          title: type === 'in' ? 'Punch-In Successful!' : 'Shift Ended Successfully!',
          message: successMsg,
          reason: data.geofence?.location_name
            ? `Verified at ${data.geofence.location_name} (Distance: ${data.geofence.distance ?? 0}m)`
            : 'Geofence verified',
        });

        toast.success(type === 'in' ? 'Punch-In Recorded' : 'Shift Completed', {
          description: successMsg,
        });
        setShowWorkLogModal(false);
        setWorkSummary('');
        setClientCount(0);
        setVisitCount(0);
        fetchStatus();
      } else {
        const errorMsg = data.error?.message || data.error || `Failed to punch ${type}`;
        const isAlreadyPunched = errorMsg.toLowerCase().includes('already punched');
        const isGeofence =
          errorMsg.toLowerCase().includes('geofence') ||
          errorMsg.toLowerCase().includes('location');

        setFeedbackNotice({
          type: isAlreadyPunched ? 'info' : isGeofence ? 'warning' : 'error',
          title: isAlreadyPunched
            ? 'Already Recorded'
            : `Unable to Punch ${type === 'in' ? 'In' : 'Out'}`,
          message: isAlreadyPunched
            ? 'Your attendance has already been recorded for today.'
            : errorMsg,
          reason: data.error?.details || errorMsg,
          actionLabel: isAlreadyPunched ? 'Refresh Status' : 'Try Again',
          onAction: () => (isAlreadyPunched ? fetchStatus() : executePunch(type)),
          secondaryActionLabel: 'Refresh GPS',
          onSecondaryAction: () => requestLocation(),
        });

        toast.error(`Punch ${type === 'in' ? 'In' : 'Out'} Notice`, {
          description: errorMsg,
        });
      }
    } catch (err: unknown) {
      const errMessage =
        err instanceof Error ? err.message : 'Network or server communication issue';

      const isNetworkIssue =
        (typeof navigator !== 'undefined' && !navigator.onLine) ||
        err instanceof TypeError ||
        errMessage.toLowerCase().includes('failed to fetch') ||
        errMessage.toLowerCase().includes('load failed') ||
        errMessage.toLowerCase().includes('network') ||
        errMessage.toLowerCase().includes('offline');
      if (isNetworkIssue && currentCoords) {
        offlinePunchQueue.enqueue({
          type,
          timestamp: new Date().toISOString(),
          coords: currentCoords,
          workSummary: type === 'out' ? workSummary : undefined,
          clientCount: type === 'out' ? clientCount : undefined,
          visitCount: type === 'out' ? visitCount : undefined,
        });

        toast.info(
          'You are currently offline. Your punch has been securely saved locally and will auto-sync once online.'
        );

        setFeedbackNotice({
          type: 'info',
          title: 'Offline Punch Saved Locally',
          message:
            'You are currently offline. Your punch has been securely saved locally and will auto-sync once online.',
          reason: 'Network connection lost during punch attempt.',
          actionLabel: 'Sync Now',
          onAction: () => handleSyncOffline(),
        });

        if (type === 'out') {
          setShowWorkLogModal(false);
          setWorkSummary('');
          setClientCount(0);
          setVisitCount(0);
        }
        return;
      }

      setFeedbackNotice({
        type: 'error',
        title: 'Connection or Server Error',
        message:
          'Could not connect to the attendance service. Please check your internet connection.',
        reason: errMessage,
        actionLabel: 'Retry',
        onAction: () => executePunch(type),
      });
      toast.error('Network Error', {
        description: 'Unable to reach the server. Please check connection and retry.',
      });
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOutClick = () => {
    setShowWorkLogModal(true);
  };

  if (loading) {
    return (
      <BrandedLoadingState
        message="Checking Attendance Status & Geofence..."
        subMessage="Syncing shift timing rules and active office zones"
      />
    );
  }

  const todayFormatted = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Employee Profile Banner & Quick Refresh */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              GPS Attendance Terminal
            </h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Live IST
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {todayFormatted} • Geofence verified shift tracker
          </p>
        </div>

        {/* User Info & Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {statusData.full_name && (
            <div className="hidden rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-right sm:block dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {statusData.full_name}
              </span>
              <span className="block text-[10px] text-slate-400">
                Team: {statusData.team_name || 'TEAM SVI'}
              </span>
            </div>
          )}

          <button
            onClick={fetchStatus}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Actionable Feedback Banner */}
      <PunchFeedbackBanner notice={feedbackNotice} onDismiss={() => setFeedbackNotice(null)} />

      {/* Offline Punch Sync Notice Banner */}
      {offlineQueue.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm sm:flex-row sm:items-center dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-base font-bold text-amber-700 dark:text-amber-300">
              ⚡
            </span>
            <div>
              <p className="text-xs font-bold sm:text-sm">
                {offlineQueue.length} Offline Punch{offlineQueue.length > 1 ? 'es' : ''} Queued
                (Auto-sync active)
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Punches recorded offline will automatically upload when network connection is
                restored.
              </p>
            </div>
          </div>
          <button
            onClick={handleSyncOffline}
            disabled={isSyncingOffline}
            className="flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-amber-500 disabled:opacity-50 sm:self-auto"
          >
            {isSyncingOffline ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <span>Sync Now</span>
            )}
          </button>
        </div>
      )}

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Main Terminal Card (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <PunchTerminalWidget
            statusData={statusData}
            elapsedTime={elapsedTime}
            punching={punching}
            settings={settings}
            onPunchIn={() => executePunch('in')}
            onPunchOutClick={handlePunchOutClick}
            queuedPunchesCount={offlineQueue.length}
            onSyncOffline={handleSyncOffline}
            isSyncingOffline={isSyncingOffline}
            userId={statusData.user_id}
          />
        </div>

        {/* RIGHT COLUMN: GPS Live Radar & Admin Shift Guidelines (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <GeofenceStatusCard
            locationStatus={locationStatus}
            coords={coords}
            accuracy={accuracy}
            isGeofenceVerified={statusData.is_geofence_verified}
            activeLocations={locations}
            onRefreshLocation={requestLocation}
            onRequestPermission={requestLocation}
          />

          <ShiftGuidelinesCard settings={settings} locations={locations} />
        </div>
      </div>

      {/* Today's Shift Work Log Summary (if punched out) */}
      {statusData.status === 'punched_out' &&
        (statusData.summary_text || statusData.total_hours) && (
          <div className="rounded-3xl border border-blue-200/80 bg-blue-50/40 p-5 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
              <h3 className="text-sm font-bold">Today's Completed Shift Summary</h3>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-blue-900/30 dark:bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Total Duty Hours
                </span>
                <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
                  {statusData.total_hours
                    ? `${statusData.total_hours.toFixed(2)} hrs`
                    : 'Completed'}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-blue-900/30 dark:bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Client Meetings
                </span>
                <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
                  {statusData.client_interactions_count || 0} interactions
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-blue-900/30 dark:bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Site Visits Done
                </span>
                <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
                  {statusData.site_visits_conducted_count || 0} visits
                </p>
              </div>
            </div>
            {statusData.summary_text && (
              <div className="mt-3 rounded-2xl border border-blue-100 bg-white p-3.5 dark:border-blue-900/30 dark:bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Work Log / Summary
                </span>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                  {statusData.summary_text}
                </p>
              </div>
            )}
          </div>
        )}

      {/* Work Summary Modal on Punch-Out */}
      <PunchOutWorkLogModal
        isOpen={showWorkLogModal}
        onClose={() => setShowWorkLogModal(false)}
        workSummary={workSummary}
        onWorkSummaryChange={setWorkSummary}
        clientCount={clientCount}
        onClientCountChange={setClientCount}
        visitCount={visitCount}
        onVisitCountChange={setVisitCount}
        onConfirmPunchOut={() => executePunch('out')}
        punching={punching}
      />
    </div>
  );
}
