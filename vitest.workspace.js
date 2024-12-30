import { defineWorkspace } from 'vitest/config'

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  // '.',
  // matches every folder and file inside the `packages` folder
  {
    // add "extends" to merge two configs together
    extends: './vite.config.js',
    // name: 'unit',
    test: {
      include: ['src/**/*.test.js'],
      // it is recommended to define a name when using inline configs
      name: 'unit',
    },
  },
  {
    extends: './vite.config.js',
    // name: 'integration',
    test: {
      include: ['tests/**/*.spec.js'],
      name: 'integration',
      testTimeout: 60000,
    },
  },
])
