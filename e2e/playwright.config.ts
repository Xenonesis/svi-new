import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [['html', { outputFolder: '../playwright-report' }], ['list']],
  use: {
    baseURL:
      process.env.BASE_URL ||
      (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
    reuseExistingServer: true,
    timeout: 180000,
    env: {
      SKIP_IMAGE_OPTIMIZE: 'true',
    },
  },
});
