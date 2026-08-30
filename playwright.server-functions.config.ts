import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/server-functions',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure' },
  outputDir: 'test-results/server-functions',
  webServer: {
    command: 'pnpm exec vite dev --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    env: { SURVEY_DATA_FILE: 'test-results/server-functions/surveys.jsonl' },
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
