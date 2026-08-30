'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { offlinePunchQueue, QueuedPunch } from '@/src/lib/attendance/offlinePunchQueue';
import {
  getDeviceCoordinates,
  watchDevicePosition,
  ensureLocationPermission,
  LocationResult,
} from '@/src/lib/location/geolocationService';
import type { FeedbackNotice } from '@/src/components/employee/attendance/PunchFeedbackBanner';
import type { AttendanceStatusResponse, AttendanceSettings, GeofenceLocation } from './types';

export function useEmployeeAttendanceTerminal() {
  const [statusData, setStatusData] = useState<AttendanceStatusResponse>({
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

  return {
    statusData,
    settings,
    locations,
    loading,
    punching,
    elapsedTime,
    locationStatus,
    coords,
    accuracy,
    showWorkLogModal,
    setShowWorkLogModal,
    workSummary,
    setWorkSummary,
    clientCount,
    setClientCount,
    visitCount,
    setVisitCount,
    feedbackNotice,
    setFeedbackNotice,
    offlineQueue,
    isSyncingOffline,
    handleSyncOffline,
    requestLocation,
    fetchStatus,
    executePunch,
  };
}
