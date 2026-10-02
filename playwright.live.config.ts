import { defineConfig, devices } from "@playwright/test";

/** Read-only smoke tests against a deployed site. No purchases, no emails, no subscriptions are triggered. */
export default defineConfig({
  testDir: "./tests",
  testMatch: "live-smoke.spec.ts",
  timeout: 60000,
  workers: 1,
  reporter: "list",
  use: { baseURL: process.env.LIVE_BASE_URL || "https://elimination.micegoneguide.com", screenshot: "only-on-failure", acceptDownloads: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
