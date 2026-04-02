import CONFIG from '../../infra/config.js'
import logger from '../../utils/logger.js'
import ScanJobService from '../extractor/scanJobService.js'
import TorrentService from '../shared/torrentService.js'
import XmlService from '../shared/xmlService.js'
import RssRepository from './repository/rssRepository.js'

export default class RssService {
  constructor(
    services = {
      xmlService: new XmlService(),
      torrentService: new TorrentService(),
      scanJobService: new ScanJobService(),
    },
    repositories = {
      rssRepository: new RssRepository(),
    }
  ) {
    this.xmlService = services.xmlService
    this.torrentService = services.torrentService
    this.scanJobService = services.scanJobService
    this.repository = repositories.rssRepository
  }

  async list(data) {
    const { term: q, t, scanAllItems, isScan = true } = data
    let term = q ?? t
    if (term) {
      term = term.replace(/ [sS]\d{1,}(.*)/g, '')
    }
    logger.info(`List -> with term ${term} -- ${JSON.stringify(data ?? {})}`)
    if (isScan === 'true' || isScan === true) {
      await this.scanJobService.enqueueScan(term, { scanAllItems: scanAllItems === 'true' || scanAllItems === true })
    }

    const response = await this.repository.list({
      term,
      limit: term ? undefined : 100,
    })

    return this.#buildItems(response)
  }

  async listAsXml(data) {
    const { term: q, t, scanAllItems, isScan = true } = data
    let term = q ?? t
    if (term) {
      term = term.replace(/ [sS]\d{1,}(.*)/g, '')
    }
    logger.info(`List -> with term ${term} -- ${JSON.stringify(data ?? {})}`)
    if (isScan === 'true' || isScan === true) {
      await this.scanJobService.enqueueScan(term, { scanAllItems: scanAllItems === 'true' || scanAllItems === true })
    }

    const response = await this.repository.list({
      term,
      limit: term ? undefined : 100,
    })

    const items = await this.#buildItems(response)
    return this.xmlService.buildToRss({ items })
  }

  async listAll() {
    return this.repository.listAll()
  }

  async count() {
    return { total: await this.repository.count() }
  }

  async #buildItems(response) {
    const items = []
    for (const item of response) {
      try {
        items.push({
          ...item,
          page: `http://${CONFIG.host}:${CONFIG.port}/${item.id}`,
          id: await this.torrentService.magnetInfo(item.magnet),
          title: this.#formatTitle(item),
        })
      } catch (error) {
        logger.warn(`buildItems item error: ${error?.message ?? error}`)
      }
    }
    return items
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
