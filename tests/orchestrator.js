import retry from 'async-retry'
import axios from 'axios'
import { execSync } from 'node:child_process'

import CONFIG from '../src/infra/config.js'
import DbService from '../src/infra/service/dbService.js'

const baseUrl = `http://localhost:${CONFIG.port}`
const api = axios.create({
  baseURL: baseUrl,
})
async function waitForAllServices() {
  await waitForWebServer()
  async function waitForWebServer() {
    async function fetchStatusPage() {
      const response = await api.get('/status')
      if (response.status !== 200) {
        throw new Error()
      }
    }
    return retry(fetchStatusPage, {
      retries: 100,
      minTimeout: 100,
      maxTimeout: 1000,
    })
  }
}

function applyMigrations() {
  try {
    execSync('npm run migration:push')
  } catch {}
}

const cleanDatabase = async () => {
  await DbService.connection.$queryRaw`truncate "Torrent";`
}

const seedDatabase = async () => {
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

const orchestrator = {
  waitForAllServices,
  api,
  baseUrl,
  applyMigrations,
  cleanDatabase,
  seedDatabase,
}

export default orchestrator
