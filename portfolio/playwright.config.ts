import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  workers: 1,
  use: { browserName: "chromium", baseURL: "http://localhost:3111" },
  webServer: {
    command: "npm run build && npm start -- -p 3111",
    url: "http://localhost:3111",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
