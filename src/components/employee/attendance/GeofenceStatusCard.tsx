'use client';

import React from 'react';
import { Navigation, MapPin, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface GeofenceStatusCardProps {
  locationStatus: 'acquiring' | 'ready' | 'error';
  coords: { lat: number; lon: number } | null;
  isGeofenceVerified: boolean;
}

export function GeofenceStatusCard({
  locationStatus,
  coords,
  isGeofenceVerified,
}: GeofenceStatusCardProps) {
  return (
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
            {isGeofenceVerified ? 'Verified within Office Bounds' : 'Auto Geofenced'}
          </p>
        </div>
      </div>
    </div>
  );
}
