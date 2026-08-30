import type { CapacitorConfig } from '@capacitor/cli';

const target = process.env.CAP_APP_TARGET || 'admin';
const isEmployee = target === 'employee';

const defaultUrl = isEmployee
  ? 'https://www.sviinfrasolutions.com/employee/login'
  : 'https://www.sviinfrasolutions.com/admin';

const serverUrl = process.env.CAP_SERVER_URL || defaultUrl;
const isDev = !!process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: isEmployee ? 'com.svi.infrasolutions.employee' : 'com.svi.infrasolutions',
  appName: isEmployee ? 'SVI Workspace' : 'SVI Admin',
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
    backgroundColor: isEmployee ? '#020617' : '#0a0a0a',
    minWebViewVersion: 60,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: isEmployee ? '#020617' : '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: isEmployee ? '#020617' : '#0a0a0a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
