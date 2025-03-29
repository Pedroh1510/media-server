import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import N8nService from '../../../../../src/domain/extractor/n8nService.js'
import orchestrator from '../../../../orchestrator.js'

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  orchestrator.applyMigrations()
})

beforeEach(async () => {
  await orchestrator.cleanDatabase()
  await orchestrator.seedDatabase()
})

describe('GET /extractor/:site/list/series', () => {
  describe('by site', () => {
    test('n8n', async () => {
      const response = await orchestrator.api.get('/extractor/n8n/list/series')
      expect(response.status).toEqual(200)

      if (!new N8nService().disable) {
        expect(response.data).to.have.length.above(0)
      }
    })
  })
})
