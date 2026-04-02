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
      exclude: [
        'src/domain/**/test/**',
        'src/domain/**/mock/**',
        'src/domain/**/repository/**',
        'src/domain/**/routes.js',
        // Site-specific HTTP scrapers (require network/integration tests)
        'src/domain/extractor/moeService.js',
        'src/domain/extractor/nyaaService.js',
        'src/domain/extractor/animeToshoService.js',
        'src/domain/extractor/tokyiToshoService.js',
        'src/domain/extractor/eraiService.js',
        'src/domain/extractor/n8nService.js',
        'src/domain/extractor/extractorRepository.js',
        // HTTP download utility
        'src/domain/shared/downloadImg.js',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
