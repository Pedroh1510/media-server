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
  },
})
