import { config } from 'dotenv'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const path = resolve('.env.development')
config({ path })

export default defineConfig({
  test: {
    env: process.env,
    logHeapUsage: true,
    testTimeout: 1000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/domain/**/*.js'],
      exclude: ['src/domain/**/test/**', 'src/domain/**/mock/**', 'src/domain/**/repository/*InMemory.js'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
