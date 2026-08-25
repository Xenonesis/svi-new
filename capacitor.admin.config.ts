import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL || 'https://www.sviinfrasolutions.com/admin';
const isDev = !!process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.svi.infrasolutions',
  appName: 'SVI Admin',
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
    backgroundColor: '#0a0a0a',
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
