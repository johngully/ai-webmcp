import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          css: true,
          include: ['tests/**/*.test.tsx'],
          setupFiles: ['./tests/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          css: true,
          include: ['tests/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Generated routing and declarations have no hand-written behavior.
      // Config, tests, CSS, and build artifacts live outside this source glob.
      exclude: ['src/routeTree.gen.ts', 'src/**/*.d.ts'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { statements: 86, branches: 86, functions: 86, lines: 86 },
    },
  },
})
