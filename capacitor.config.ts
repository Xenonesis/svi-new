import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.svi.infrasolutions',
  appName: 'SVI Infra Solutions',
  webDir: 'out', // Not used in server mode, but required by Capacitor
  server: {
    // ── IMPORTANT ──────────────────────────────────────────────────────────
    // Replace with your actual Vercel production URL.
    // Example: 'https://svi-new.vercel.app'
    // ───────────────────────────────────────────────────────────────────────
    url: 'https://www.sviinfrasolutions.com/admin',
    allowNavigation: ['www.sviinfrasolutions.com', 'sviinfrasolutions.com', '*.vercel.app'],
    cleartext: false, // HTTPS only — never allow cleartext HTTP in production
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set true only during development
    backgroundColor: '#0a0a0a', // Matches your dark theme background
    // Minimum Android API level (Android 7.0+)
    minWebViewVersion: 60,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
