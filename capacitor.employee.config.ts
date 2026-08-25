import type { CapacitorConfig } from '@capacitor/cli';

// Set CAP_SERVER_URL to dev server for local development, e.g.:
//   CAP_SERVER_URL=http://192.168.1.100:3001 npx cap run android
const serverUrl =
  process.env.CAP_SERVER_URL || 'https://www.sviinfrasolutions.com/employee/dashboard';
const isDev = !!process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.svi.infrasolutions.employee',
  appName: 'SVI Workspace',
  webDir: 'out',
  server: {
    url: serverUrl,
    allowNavigation: ['www.sviinfrasolutions.com', 'sviinfrasolutions.com', '*.vercel.app'],
    cleartext: isDev,
  },
  android: {
    allowMixedContent: isDev,
    captureInput: true,
    webContentsDebuggingEnabled: isDev,
    backgroundColor: '#020617', // slate-950
    minWebViewVersion: 60,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#020617',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
