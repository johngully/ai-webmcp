import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://127.0.0.1:4173',
    env: {
      HOST: '127.0.0.1',
      PORT: '4173',
      SURVEY_DATA_FILE: 'test-results/manual-surveys.jsonl',
    },
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
