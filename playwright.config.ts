import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the real worker (static app + API) with Stripe and Brevo replaced by local mocks,
 * so the whole purchase flow can be exercised without real accounts or money.
 * Prerequisite: `npm run build` (the worker serves ./dist).
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: ["e2e.spec.ts", "a11y.spec.ts"],
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://127.0.0.1:8787", screenshot: "only-on-failure", trace: "retain-on-failure", acceptDownloads: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    { command: "node scripts/mock-services.mjs", url: "http://127.0.0.1:9911/__calls", reuseExistingServer: true, timeout: 30000 },
    { command: "node scripts/ensure-dev-vars.mjs && npx wrangler dev --port 8787 --ip 127.0.0.1", url: "http://127.0.0.1:8787/api/health", reuseExistingServer: true, timeout: 120000 },
  ],
});
