import { eraiApi } from '../../infra/service/apiService.js'
import DateFormatter from '../../utils/dateFormatter.js'
import logger from '../../utils/logger.js'
import TorrentService from '../shared/torrentService.js'
import XmlService from '../shared/xmlService.js'
import ExtractorRepository from './extractorRepository.js'

export default class EraiService {
  constructor() {
    this.xmlService = new XmlService()
    this.torrentService = new TorrentService()
    this.repository = new ExtractorRepository()
    this.acceptedTags = []
    this.verifyTags = []
  }

  async #searchXml() {
    return eraiApi
      .get()
      .then((response) => response.data)
      .catch((e) => {
        logger.error(e)
        return null
      })
  }

  /**
   * @param {string} title
   */
  #isAcceptedTitle(title) {
    const firstCheck = this.acceptedTags.some((tag) => title.toLowerCase().includes(tag))
    const staticList = ['br']
    const secundCheck = staticList.some((tag) => title.toLowerCase().includes(tag))
    return firstCheck || secundCheck
  }

  isVerify(text) {
    return this.verifyTags.some((tag) => text.toLowerCase().includes(tag))
  }

  /**
   * @typedef {Object} Items
   * @property {String} items.title
   * @property {String} items.subtitles
   * @property {String} items.link
   * @property {String} items.pubDate
   * @property {String} items.description
   * @returns {Promise<Items[]>}
   */
  async #getData() {
    const xml = await this.#searchXml()
    if (!xml) return
    const json = this.xmlService.parserToJson(xml)
    if (!json?.rss) return null
    if (!json.rss?.channel) return null
    if (!json.rss.channel?.item) return null
    json.rss.channel.item = Array.isArray(json.rss.channel.item) ? json.rss.channel.item : [json.rss.channel.item]
    return json.rss.channel.item.map((item) => ({ ...item, subtitles: item['erai:subtitles'] }))
  }

  /**
   * @returns {AsyncGenerator<{title: string, link: string, date: Date}>}
   */
  async *extractor() {
    logger.info('Extractor Erai -> start')
    const data = await this.#getData()
    if (!data) {
      logger.info('Extractor Erai -> end empty')
      return
    }
    const { accepted, verify } = await this.repository.listTags()
    this.verifyTags = verify.map((item) => item.tag)
    this.acceptedTags = accepted.map((item) => item.tag)
    for (const item of data) {
      if (!this.#isAcceptedTitle(item.subtitles)) continue
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      yield {
        title: item.title,
        link: item.link,
        date: DateFormatter.toDate(dateIgnoreWeekday, 'DD MMM YYYY HH:mm:ss ZZ'),
      }
    }
    logger.info('Extractor Erai -> end')
  }
}
