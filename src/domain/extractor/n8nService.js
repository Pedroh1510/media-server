import { n8nApi } from '../../infra/service/apiService.js'

export default class N8nService {
  /**
   * @returns {AsyncGenerator<{title: string, link: string, date: Date}>}
   */
  async *extractor() {
    const response = await n8nApi.get('/darkmaou-ultimos-series-novos-eps').then((response) => response.data)

    if (!Array.isArray(response)) return
    for (const item of response) {
      for (const links of item.links) {
        for (const link of links) {
          if (!link.includes('magnet')) continue
          yield {
            title: `${item.title} - ${item.ep}`,
            link,
            date: new Date(),
          }
        }
      }
    }
  }

  async listSeries() {
    const response = await n8nApi.get('/darkmaou-list-series').then((response) => response.data)

    return response ?? []
  }

  /**
   * @returns {AsyncGenerator<{title: string, link: string, date: Date}>}
   */
  async *listEps({ name, link }) {
    const response = await n8nApi.post('/darkmaou-list-eps', { name, link }).then((response) => response.data)

    if (!Array.isArray(response)) return
    for (const item of response) {
      for (const links of item.links) {
        for (const link of links) {
          if (!link.includes('magnet')) continue
          yield {
            title: `${item.title} - ${item.ep}`,
            link,
            date: new Date(),
          }
        }
      }
    }
  }
}
