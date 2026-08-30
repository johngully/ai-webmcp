import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/server-functions',
  workers: 1,
  projects: [{ name: 'server-functions' }],
  use: { trace: 'retain-on-failure' },
  outputDir: 'test-results/server-functions',
})
