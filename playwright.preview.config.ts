import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/preview",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/preview", open: "never" }]],
  outputDir: "test-results/preview",
  use: {
    baseURL: "http://127.0.0.1:3100/compressor/",
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || "/usr/bin/chromium", args: ["--no-sandbox"] },
  },
  webServer: {
    command: "node scripts/serve-preview.mjs",
    url: "http://127.0.0.1:3100/compressor/",
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
