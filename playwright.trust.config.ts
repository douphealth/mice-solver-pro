import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'trust-reset.spec.ts', timeout: 45000, retries: 0,
  use: { baseURL: 'http://127.0.0.1:4173', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
});
