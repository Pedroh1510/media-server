import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import orchestrator from '../orchestrator.js'

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  orchestrator.applyMigrations()
})

beforeEach(async () => {
  await orchestrator.cleanDatabase()
  await orchestrator.seedDatabase()
})

describe('Extractor', () => {
  describe('by site', () => {
    test('nyaa', async () => {
      const response = await orchestrator.api.get('/extractor/nyaa', {
        params: {
          q: 'Kekkon Surutte, Hontou Desuka',
        },
      })
      expect(response.status).toEqual(200)
      expect(response.data).toEqual({ total: 25 })
    })
  })
})
