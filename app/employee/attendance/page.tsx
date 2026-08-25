'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PunchTerminalWidget } from '@/src/components/employee/attendance/PunchTerminalWidget';
import { GeofenceStatusCard } from '@/src/components/employee/attendance/GeofenceStatusCard';
import { ShiftGuidelinesCard } from '@/src/components/employee/attendance/ShiftGuidelinesCard';
import { PunchOutWorkLogModal } from '@/src/components/employee/attendance/PunchOutWorkLogModal';

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

  // Acquire Geolocation
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
      () => {
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

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
    try {
      let currentCoords = coords;
      if (!currentCoords && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
            });
          });
          currentCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setCoords(currentCoords);
        } catch {
          // Proceed with null coords (backend fallback)
        }
      }

      const endpoint =
        type === 'in' ? '/api/employee/attendance/punch-in' : '/api/employee/attendance/punch-out';

      const bodyPayload: Record<string, unknown> = {
        latitude: currentCoords?.lat,
        longitude: currentCoords?.lon,
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
        toast.success(
          type === 'in'
            ? 'Successfully punched in! Have a great day.'
            : 'Shift completed! Punch out recorded.'
        );
        setShowWorkLogModal(false);
        setWorkSummary('');
        setClientCount(0);
        setVisitCount(0);
        fetchStatus();
      } else {
        toast.error(data.error?.message || `Failed to punch ${type}`);
      }
    } catch {
      toast.error(`Error recording punch ${type}`);
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
          <PunchTerminalWidget
            statusData={statusData}
            elapsedTime={elapsedTime}
            punching={punching}
            onPunchIn={() => executePunch('in')}
            onPunchOutClick={handlePunchOutClick}
          />
        </div>

        {/* RIGHT COLUMN: GPS Details & Shift Guidelines (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <GeofenceStatusCard
            locationStatus={locationStatus}
            coords={coords}
            isGeofenceVerified={statusData.is_geofence_verified}
          />

          <ShiftGuidelinesCard />
        </div>
      </div>

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
