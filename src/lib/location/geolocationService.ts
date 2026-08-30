import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  source: 'capacitor-native' | 'browser-high' | 'browser-low';
}

export interface GeolocationError {
  code: number | string;
  message: string;
  isPermissionDenied?: boolean;
}

/**
 * Checks and requests location permission on both Native (Capacitor) and Browser environments.
 */
export async function ensureLocationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Try Native Capacitor Permission flow if available
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'granted' || status.coarseLocation === 'granted') {
        return true;
      }
      const req = await Geolocation.requestPermissions();
      return req.location === 'granted' || req.coarseLocation === 'granted';
    } catch (nativeErr) {
      console.warn('Native permission check encountered warning:', nativeErr);
    }
  }

  // 2. Fallback to Browser Permissions API if supported
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'granted' || status.state === 'prompt') {
        return true;
      }
    } catch {
      // Ignore permissions.query errors (e.g. Firefox/Safari variations)
    }
  }

  return true;
}

/**
 * Acquires coordinates with multi-tier failover:
 * 1. Native Capacitor High Accuracy
 * 2. Native Capacitor Standard Accuracy
 * 3. Browser Navigator High Accuracy
 * 4. Browser Navigator Standard Accuracy
 */
export async function getDeviceCoordinates(
  options: {
    timeout?: number;
    enableHighAccuracy?: boolean;
    maximumAge?: number;
  } = {}
): Promise<LocationResult> {
  const { timeout = 10000, enableHighAccuracy = true, maximumAge = 30000 } = options;

  if (typeof window === 'undefined') {
    throw { code: 'UNAVAILABLE', message: 'Window is undefined' } as GeolocationError;
  }

  // Attempt 1: Native Capacitor Plugin
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureLocationPermission();
      const pos: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge,
      });

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy || null,
        altitude: pos.coords.altitude || null,
        speed: pos.coords.speed || null,
        heading: pos.coords.heading || null,
        source: 'capacitor-native',
      };
    } catch (nativeErr: unknown) {
      console.warn(
        'Capacitor native geolocation high-accuracy failed, retrying standard:',
        nativeErr
      );
      try {
        const fallbackPos: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        });

        return {
          latitude: fallbackPos.coords.latitude,
          longitude: fallbackPos.coords.longitude,
          accuracy: fallbackPos.coords.accuracy || null,
          altitude: fallbackPos.coords.altitude || null,
          source: 'capacitor-native',
        };
      } catch (nativeFallbackErr) {
        console.warn(
          'Native fallback also failed, shifting to Web Geolocation API:',
          nativeFallbackErr
        );
      }
    }
  }

  // Attempt 2: Standard Browser / WebView Navigator Geolocation
  if (!navigator.geolocation) {
    throw {
      code: 'NOT_SUPPORTED',
      message: 'Geolocation is not supported by your browser or device.',
    } as GeolocationError;
  }

  return new Promise<LocationResult>((resolve, reject) => {
    // Try High Accuracy first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || null,
          altitude: pos.coords.altitude || null,
          speed: pos.coords.speed || null,
          heading: pos.coords.heading || null,
          source: 'browser-high',
        });
      },
      (err) => {
        console.warn('Browser High Accuracy GPS failed or timed out:', err.message);

        // Try Standard Accuracy fallback
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            resolve({
              latitude: fallbackPos.coords.latitude,
              longitude: fallbackPos.coords.longitude,
              accuracy: fallbackPos.coords.accuracy || null,
              altitude: fallbackPos.coords.altitude || null,
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
 * Subscribes to live position updates with auto-cleanup.
 */
export function watchDevicePosition(
  onUpdate: (location: LocationResult) => void,
  onError?: (error: GeolocationError) => void,
  options: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
): () => void {
  if (typeof window === 'undefined') return () => {};

  let isCleanedUp = false;
  let nativeCallbackId: string | null = null;
  let webWatchId: number | null = null;

  if (Capacitor.isNativePlatform()) {
    Geolocation.watchPosition(options, (position, err) => {
      if (isCleanedUp) return;
      if (err) {
        if (onError) onError({ code: 'WATCH_ERROR', message: err.message });
        return;
      }
      if (position) {
        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || null,
          altitude: position.coords.altitude || null,
          source: 'capacitor-native',
        });
      }
    }).then((id) => {
      if (isCleanedUp) {
        Geolocation.clearWatch({ id });
      } else {
        nativeCallbackId = id;
      }
    });
  } else if (navigator.geolocation) {
    webWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (isCleanedUp) return;
        onUpdate({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || null,
          altitude: pos.coords.altitude || null,
          source: 'browser-high',
        });
      },
      (err) => {
        if (isCleanedUp) return;
        if (onError) {
          onError({
            code: err.code,
            message: err.message,
            isPermissionDenied: err.code === err.PERMISSION_DENIED,
          });
        }
      },
      options
    );
  }

  return () => {
    isCleanedUp = true;
    if (nativeCallbackId) {
      Geolocation.clearWatch({ id: nativeCallbackId });
    }
    if (webWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(webWatchId);
    }
  };
}
