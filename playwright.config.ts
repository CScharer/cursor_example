import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.api\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'database-tests',
      testMatch: /.*\.db\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});