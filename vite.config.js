import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: 'test',
    logHeapUsage: true,
    testTimeout: 1000,
  },
})
