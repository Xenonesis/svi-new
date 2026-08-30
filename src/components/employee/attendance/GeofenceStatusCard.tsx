'use client';

import React from 'react';
import {
  Navigation,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';
import { clsx } from 'clsx';

interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

interface GeofenceStatusCardProps {
  locationStatus: 'acquiring' | 'ready' | 'error';
  coords: { lat: number; lon: number } | null;
  accuracy?: number | null;
  isGeofenceVerified: boolean;
  activeLocations?: GeofenceLocation[];
  onRefreshLocation: () => void;
  onRequestPermission?: () => void;
}

// Haversine formula to compute distance in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function GeofenceStatusCard({
  locationStatus,
  coords,
  accuracy,
  isGeofenceVerified,
  activeLocations = [],
  onRefreshLocation,
  onRequestPermission,
}: GeofenceStatusCardProps) {
  // Compute closest active office and distance
  let nearestOffice: GeofenceLocation | null = null;
  let distanceToOffice: number | null = null;
  let isWithinZone = false;

  if (coords && activeLocations.length > 0) {
    for (const loc of activeLocations) {
      const dist = calculateDistanceMeters(
        coords.lat,
        coords.lon,
        Number(loc.latitude),
        Number(loc.longitude)
      );
      if (distanceToOffice === null || dist < distanceToOffice) {
        distanceToOffice = dist;
        nearestOffice = loc;
      }
    }

    if (nearestOffice && distanceToOffice !== null) {
      const allowedRadius = Number(nearestOffice.radius_meters) || 200;
      isWithinZone = distanceToOffice <= allowedRadius;
    }
  } else if (activeLocations.length === 0) {
    // If no locations configured by admin, allow anywhere
    isWithinZone = true;
  }

  const effectiveVerified = isGeofenceVerified || isWithinZone;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              GPS Geofence Live Radar
            </h3>
            <p className="text-[11px] text-slate-500">
              Live proximity to approved SVI office & project sites
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshLocation}
            title="Refresh GPS Coordinates"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RefreshCw
              className={clsx('h-3.5 w-3.5', locationStatus === 'acquiring' && 'animate-spin')}
            />
          </button>

          <span
            className={clsx(
              'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
              locationStatus === 'ready'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : locationStatus === 'acquiring'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-red-500/15 text-red-600 dark:text-red-400'
            )}
          >
            {locationStatus === 'ready' ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                GPS Locked
              </>
            ) : locationStatus === 'acquiring' ? (
              <>
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
                Acquiring GPS...
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                Location Denied
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid of Geofence details */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Device Coordinates & Accuracy */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              <span>Current Coordinates</span>
            </div>
            {accuracy !== undefined && accuracy !== null && (
              <span className="font-mono text-[10px] text-slate-400">
                ±{Math.round(accuracy)}m accuracy
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {coords
              ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`
              : 'Scanning device GPS...'}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <LocateFixed className="h-3 w-3 text-emerald-500" />
            <span>High-precision satellite lock</span>
          </div>
        </div>

        {/* Nearest Office & Distance */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Geofence Boundary</span>
            </div>
            <span
              className={clsx(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                effectiveVerified
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              )}
            >
              {effectiveVerified ? 'In Work Zone ✓' : 'Outside Zone'}
            </span>
          </div>

          <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
            {nearestOffice ? nearestOffice.name : 'SVI Head Office'}
          </p>

          <p className="mt-2 text-[11px] text-slate-500">
            {distanceToOffice !== null ? (
              <span>
                Distance to base:{' '}
                <strong
                  className={clsx(
                    effectiveVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'
                  )}
                >
                  {distanceToOffice < 1000
                    ? `${distanceToOffice}m`
                    : `${(distanceToOffice / 1000).toFixed(2)}km`}
                </strong>{' '}
                (Allowed: {nearestOffice?.radius_meters || 200}m)
              </span>
            ) : (
              'Calculating proximity...'
            )}
          </p>
        </div>
      </div>

      {/* Warning banner if location denied */}
      {locationStatus === 'error' && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500" />
            <span>GPS location access required to verify office proximity.</span>
          </div>
          {onRequestPermission && (
            <button
              onClick={onRequestPermission}
              className="ml-2 rounded-lg bg-red-600 px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-red-700"
            >
              Enable GPS
            </button>
          )}
        </div>
      )}
    </div>
  );
}
