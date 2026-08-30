import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const adminConfig = {
  appId: 'com.svi.infrasolutions',
  appName: 'SVI Admin',
  webDir: 'out',
  server: {
    url: process.env.CAP_SERVER_URL || 'https://www.sviinfrasolutions.com/admin',
    allowNavigation: ['www.sviinfrasolutions.com', 'sviinfrasolutions.com', '*.vercel.app'],
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
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

const employeeConfig = {
  appId: 'com.svi.infrasolutions.employee',
  appName: 'SVI Workspace',
  webDir: 'out',
  server: {
    url: process.env.CAP_SERVER_URL || 'https://www.sviinfrasolutions.com/employee/login',
    allowNavigation: ['www.sviinfrasolutions.com', 'sviinfrasolutions.com', '*.vercel.app'],
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#020617',
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

// Ensure directories
const adminAssetsDir = path.join(rootDir, 'android/app/src/admin/assets');
const employeeAssetsDir = path.join(rootDir, 'android/app/src/employee/assets');
const mainAssetsDir = path.join(rootDir, 'android/app/src/main/assets');

fs.mkdirSync(adminAssetsDir, { recursive: true });
fs.mkdirSync(employeeAssetsDir, { recursive: true });

fs.writeFileSync(
  path.join(adminAssetsDir, 'capacitor.config.json'),
  JSON.stringify(adminConfig, null, 2)
);
fs.writeFileSync(
  path.join(employeeAssetsDir, 'capacitor.config.json'),
  JSON.stringify(employeeConfig, null, 2)
);

// Remove main assets fallback to avoid cross-flavor pollution
const mainConfigFile = path.join(mainAssetsDir, 'capacitor.config.json');
if (fs.existsSync(mainConfigFile)) {
  fs.unlinkSync(mainConfigFile);
}

console.log('[OK] Synced flavor-specific capacitor.config.json for Admin and Employee Workspace');
