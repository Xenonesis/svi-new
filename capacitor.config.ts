import type { CapacitorConfig } from '@capacitor/cli';

// Set CAP_SERVER_URL to your dev server for local development, e.g.:
//   CAP_SERVER_URL=http://192.168.1.100:3001 npx cap run android
const serverUrl = process.env.CAP_SERVER_URL || 'https://www.sviinfrasolutions.com/admin';
const isDev = !!process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.svi.infrasolutions',
  appName: 'SVI Infra Solutions',
  webDir: 'out', // Not used in server mode, but required by Capacitor
  server: {
    url: serverUrl,
    allowNavigation: ['www.sviinfrasolutions.com', 'sviinfrasolutions.com', '*.vercel.app'],
    cleartext: isDev, // Allow cleartext HTTP only during local development
  },
  android: {
    allowMixedContent: isDev,
    captureInput: true,
    webContentsDebuggingEnabled: isDev,
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
