import XmlService from '../shared/xmlService.js'
import TorrentService from '../shared/torrentService.js'
import DateFormatter from '../../utils/dateFormatter.js'
import logger from '../../utils/logger.js'
import { acceptedTags } from '../../utils/constants.js'
import { nyaaApi } from '../../infra/service/apiService.js'

export default class NyaaService {
  constructor () {
    this.xmlService = new XmlService()
    this.torrentService = new TorrentService()
    this.acceptedTags = acceptedTags
  }

  /**
   * @param {string} term
   */
  async #searchXml (term) {
    return nyaaApi.get("/", {
      params: {
        page: 'rss',
        c: '1_0',
        q: term
      }
    }).then(response => response.data)
      .catch(() => null)
  }

  /**
   * @param {string} title
   */
  #isAcceptedTitle (title) {
    return !this.acceptedTags.some((tag) => title.toLowerCase().includes(tag))
  }

  /**
   * @param {string} term
   * @returns {AsyncGenerator<{title: string, link: string, date: Date}>}
   */
  async * extractor (term) {
    logger.info('Extractor Nyaa -> start')
    const xml = await this.#searchXml(term)
    if (!xml) return
    const json = this.xmlService.parserToJson(xml)
    const isValidXml = json?.rss && json.rss?.channel && Array.isArray(json.rss.channel?.item)
    if (!isValidXml) return
    for (const item of json.rss.channel.item) {
      if (this.#isAcceptedTitle(item.title)) continue
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      const link = this.torrentService.infoHashToMagnet(item['nyaa:infoHash'])
      try {
        await this.torrentService.magnetInfo(link)
      } catch (error) {
        continue
      }
      yield {
        title: item.title,
        link: this.torrentService.infoHashToMagnet(item['nyaa:infoHash']),
        date: DateFormatter.toDate(dateIgnoreWeekday, 'DD MMM YYYY HH:mm:ss ZZ')
      }
    }

    logger.info('Extractor Nyaa -> end')
  }
}
