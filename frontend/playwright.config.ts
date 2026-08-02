import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],

  // Serve the production build so E2E exercises what actually ships.
  webServer: {
    // Bind explicitly to 127.0.0.1. `vite preview` otherwise binds to
    // `localhost`, which on GitHub runners resolves to ::1 (IPv6) first while
    // the `url` below polls IPv4 -- the server comes up fine and Playwright
    // still times out waiting for it.
    command: `npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Without these, Playwright swallows the server's output and a startup
    // failure surfaces only as an opaque "Timed out waiting 120000ms".
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
