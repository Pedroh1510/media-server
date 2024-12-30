import retry from 'async-retry'
import axios from 'axios'

import CONFIG from '../src/infra/config.js'

const baseUrl = `http://localhost:${CONFIG.port}`
const api = axios.create({
  baseURL: baseUrl,
})
async function waitForAllServices() {
  await waitForWebServer()
  async function waitForWebServer() {
    async function fetchStatusPage() {
      const response = await api.get('rss/amount')
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

const orchestrator = {
  waitForAllServices,
  api,
  baseUrl,
}

export default orchestrator