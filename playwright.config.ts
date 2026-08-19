import { defineConfig } from '@playwright/test';
import baseConfig from './e2e/playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './e2e/tests',
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
});
