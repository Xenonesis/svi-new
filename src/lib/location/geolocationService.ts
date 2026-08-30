/**
 * geolocationService.ts
 *
 * Universal location engine for SVI apps.
 *
 * Remote-URL Capacitor WebView context
 * ─────────────────────────────────────
 * The app loads sviinfrasolutions.com inside a Capacitor WebView.
 * In this mode Capacitor.isNativePlatform() returns FALSE because the JS
 * bridge is NOT injected into remote-origin pages.
 *
 * We therefore rely on the standard navigator.geolocation API, combined with
 * the GeolocationPermissions override in MainActivity.java that silently
 * auto-grants the WebView geolocation prompt whenever the Android OS location
 * permission is already held by the app.
 *
 * Flow on device:
 *   1. App launches → MainActivity requests ACCESS_FINE_LOCATION from the OS
 *   2. User taps Allow → OS grants the permission
 *   3. WebView loads remote page; page calls navigator.geolocation
 *   4. WebView fires onGeolocationPermissionsShowPrompt → MainActivity
 *      auto-grants it (OS permission already held) → no second prompt shown
 *   5. GPS coordinates arrive through the normal browser geolocation path
 */

import { Geolocation } from '@capacitor/geolocation';
import type { PositionOptions } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  source: 'browser-high' | 'browser-low' | 'capacitor-native';
}

export interface GeolocationError {
  code: number | string;
  message: string;
  isPermissionDenied?: boolean;
}

/**
 * Checks / requests location permission.
 * In remote-URL WebView builds the OS permission is requested by
 * MainActivity on startup; here we verify via the Permissions API.
 */
export async function ensureLocationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Capacitor native plugin — only works when bridge is live (local-URL builds)
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'granted' || status.coarseLocation === 'granted') {
        return true;
      }
      const req = await Geolocation.requestPermissions();
      return req.location === 'granted' || req.coarseLocation === 'granted';
    } catch {
      // Plugin unavailable — fall through
    }
  }

  // Web Permissions API (non-blocking check)
  if (navigator.permissions?.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state !== 'denied';
    } catch {
      // Firefox / older WebView may throw
    }
  }

  // Assume permission is obtainable — prompt will appear on first call
  return true;
}

/**
 * Acquires device coordinates.
 *
 * Priority:
 *   1. Capacitor native plugin (only when bridge is live — local-URL builds)
 *   2. navigator.geolocation high-accuracy  ← primary path on remote-URL
 *   3. navigator.geolocation standard-accuracy (fallback)
 */
export async function getDeviceCoordinates(
  options: {
    timeout?: number;
    enableHighAccuracy?: boolean;
    maximumAge?: number;
  } = {}
): Promise<LocationResult> {
  const { timeout = 12000, enableHighAccuracy = true, maximumAge = 30000 } = options;

  if (typeof window === 'undefined') {
    throw { code: 'UNAVAILABLE', message: 'Window is undefined' } as GeolocationError;
  }

  // Attempt 1 — Capacitor native (bridge must be injected into the page)
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureLocationPermission();
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy, timeout, maximumAge });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
        altitude: pos.coords.altitude ?? null,
        speed: pos.coords.speed ?? null,
        heading: pos.coords.heading ?? null,
        source: 'capacitor-native',
      };
    } catch {
      // Capacitor native failed — fall through to browser API
    }
  }

  // Attempts 2 & 3 — navigator.geolocation
  // Works in Android WebView when MainActivity grants the geolocation prompt.
  if (!navigator.geolocation) {
    throw {
      code: 'NOT_SUPPORTED',
      message: 'Geolocation is not supported by your browser or device.',
    } as GeolocationError;
  }

  return new Promise<LocationResult>((resolve, reject) => {
    // High-accuracy attempt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          altitude: pos.coords.altitude ?? null,
          speed: pos.coords.speed ?? null,
          heading: pos.coords.heading ?? null,
          source: 'browser-high',
        });
      },
      (err) => {
        console.warn('GPS high-accuracy failed:', err.code, err.message);
        // Standard-accuracy fallback
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
              altitude: pos.coords.altitude ?? null,
              source: 'browser-low',
            });
          },
          (finalErr) => {
            reject({
              code: finalErr.code,
              message: finalErr.message,
              isPermissionDenied: finalErr.code === finalErr.PERMISSION_DENIED,
            } as GeolocationError);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}

/**
 * Subscribes to live position updates.
 * Returns a cleanup function that cancels the watcher.
 */
export function watchDevicePosition(
  onUpdate: (location: LocationResult) => void,
  onError?: (error: GeolocationError) => void,
  options: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
): () => void {
  let watchId: number | null = null;
  let nativeWatchId: string | null = null;
  let cancelled = false;

  if (Capacitor.isNativePlatform()) {
    // Native watcher (local-URL builds)
    ensureLocationPermission()
      .then(() =>
        Geolocation.watchPosition(options, (pos, err) => {
          if (cancelled) return;
          if (err) {
            onError?.({ code: err.code ?? 'UNKNOWN', message: err.message ?? 'Watch error' });
            return;
          }
          if (pos) {
            onUpdate({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
              altitude: pos.coords.altitude ?? null,
              source: 'capacitor-native',
            });
          }
        })
      )
      .then((id) => {
        nativeWatchId = id;
      })
      .catch(() => {});
  } else if (typeof window !== 'undefined' && navigator.geolocation) {
    // Browser watcher — primary path for remote-URL WebView
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return;
        onUpdate({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          altitude: pos.coords.altitude ?? null,
          source: 'browser-high',
        });
      },
      (err) => {
        if (cancelled) return;
        onError?.({
          code: err.code,
          message: err.message,
          isPermissionDenied: err.code === err.PERMISSION_DENIED,
        });
      },
      options
    );
  }

  return () => {
    cancelled = true;
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (nativeWatchId !== null) {
      Geolocation.clearWatch({ id: nativeWatchId }).catch(() => {});
    }
  };
}
