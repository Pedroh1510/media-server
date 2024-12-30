import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import DbService from '../../src/infra/service/dbService.js'
import orchestrator from '../orchestrator.js'

const clean = async () => {
  await DbService.connection.$queryRaw`truncate "Torrent";`
}

const seed = async () => {
  const tags = [
    'portuguese(brazil)',
    'pt(br)',
    'portuguese (brazilian)',
    'portuguese[br]',
    'por-br',
    'pt-bt',
    'pt-br',
    'portuguese',
  ]
  const verify = ['mult-sub', 'multi sub']

  await DbService.connection.acceptedTags.createMany({
    data: tags.map((tag) => ({ tag })),
    skipDuplicates: true,
  })
  await DbService.connection.verifyTags.createMany({
    data: verify.map((tag) => ({ tag })),
    skipDuplicates: true,
  })
}
beforeAll(async () => {
  await orchestrator.waitForAllServices()
})
beforeEach(async () => {
  await clean()
  await seed()
})
describe('RSS', () => {
  describe('Amount', () => {
    test('Total itens', async () => {
      const response = await fetch('http://localhost:3033/rss/amount')

      expect(response.status).toEqual(200)
      const responseBody = await response.json()
      expect(responseBody).toEqual({
        total: 0,
      })
    })
  })
  describe('list', () => {
    test('list Kekkon Surutte, Hontou Desuka', async () => {
      const response = await orchestrator.api.get('rss', {
        params: {
          term: 'Kekkon Surutte, Hontou Desuka',
          scanAllItems: false,
          isScan: false,
        },
      })

      expect(response.status).toEqual(200)
      expect(response.data)
        .toEqual(`<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:nyaa="https://nyaa.si/xmlns/nyaa" version="2.0">
  <channel>
    <title>Nyaa - Home - Torrent File RSS</title>
    <description>RSS Feed for Home</description>
    <link>http://localhost:3033/</link>
    <atom:link href="http://localhost:3033" rel="self" type="application/rss+xml"></atom:link>
    <language>en</language>
  </channel>
</rss>
`)
    })
  })

  describe('list json', () => {
    test('list Kekkon Surutte, Hontou Desuka', async () => {
      const response = await orchestrator.api.get('rss/json', {
        params: {
          term: 'Kekkon Surutte, Hontou Desuka',
          scanAllItems: false,
          isScan: false,
        },
      })

      expect(response.status).toEqual(200)
      expect(response.data).toHaveLength(0)
    })
    test('list Kekkon Surutte, Hontou Desuka, scanAllItems = true', async () => {
      const response = await orchestrator.api.get('rss/json', {
        params: {
          term: 'Kekkon Surutte, Hontou Desuka',
          scanAllItems: true,
          isScan: true,
        },
      })

      expect(response.status).toEqual(200)
      expect(response.data).toHaveLength(25)
    })
  })
})
