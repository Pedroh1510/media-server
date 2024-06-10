import CONFIG from '../../infra/config.js'
import logger from '../../utils/logger.js'
import ExtractorService from '../extractor/extractorService.js'
import TorrentService from '../shared/torrentService.js'
import XmlService from '../shared/xmlService.js'
import RssRepository from './repository/rssRepository.js'

export default class RssService {
  constructor(
    services = {
      xmlService: new XmlService(),
      torrentService: new TorrentService(),
      extractorService: new ExtractorService(),
    },
    repositories = {
      rssRepository: new RssRepository(),
    }
  ) {
    this.xmlService = services.xmlService
    this.torrentService = services.torrentService
    this.extractorService = services.extractorService
    this.repository = repositories.rssRepository
  }

  async list(data) {
    const { term: q, t, scanAllItems } = data
    let term = q ?? t
    if (term) {
      term = term.replace(/ [sS]\d{1,4}/, '')
    }
    logger.info(`List -> with term ${term} -- ${JSON.stringify(data ?? {})}`)
    await this.extractorService.extractorRss({ q: term }, !!scanAllItems)

    const response = await this.repository.list({
      term,
      limit: term ? undefined : 100,
    })

    const items = []

    for (const item of response) {
      try {
        items.push({
          ...item,
          page: `http://192.168.0.19:${CONFIG.port}}/${item.id}`,
          id: await this.torrentService.magnetInfo(item.magnet),
          title: this.#formatTitle(item),
        })
      } catch (error) {
        // logger.error(`list item => ${JSON.stringify(item)}`)
      }
    }

    return this.xmlService.buildToRss({ items })
  }

  async listAll() {
    return this.repository.listAll()
  }

  async count() {
    return { total: await this.repository.count() }
  }

  /**
   *
   * @param {{title:string}} param0
   * @returns {string}
   */
  #formatTitle({ title }) {
    const reg = /\dnd Season - (\d){2}/
    const result = title.match(reg)
    if (result !== null) {
      const q = result[0]
      const ep = q.split(' - ').pop()
      const session = q.split('nd').shift()
      title = title.replace(q, `${result[0]} - ${session}x${ep}`)
      title = title.replace(reg, '')
      return title
    }
    return title
  }
}
