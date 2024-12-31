import axios from 'axios'

import DateFormatter from '../../utils/dateFormatter.js'
import logger from '../../utils/logger.js'
import TorrentService from '../shared/torrentService.js'
import XmlService from '../shared/xmlService.js'

export default class TokyoToshoService {
  constructor() {
    this.xmlService = new XmlService()
    this.torrentService = new TorrentService()
    this.acceptedTags = ['pt-bt', 'por-br', 'pt-br']
  }

  /**
   * @param {string} term
   * @returns {Promise<string>}
   */
  async #searchXml() {
    return axios
      .get('https://www.tokyotosho.info/rss.php', {
        params: {
          filter: ['1', '10', '3', '8', '4', '12', '13', 14, 15, 5],
          terms: 'Detective Conan',
          // terms:term
        },
      })
      .then((response) => response.data)
      .catch(() => {
        return null
      })
  }

  /**
   * @param {string} title
   */
  #isAcceptedTitle(title) {
    const a = title.toLowerCase()
    return this.acceptedTags.some((tag) => a.includes(tag))
  }

  /**
   * @param {string} term
   * @returns {AsyncGenerator<{title: string, link: string, date: Date}>}
   */
  async *extractor(term) {
    logger.info('Extractor TokyoTosho -> start')
    const xml = await this.#searchXml(term)
    if (!xml) return
    const json = this.xmlService.parserToJson(xml)
    const isValidXml = json?.rss && json.rss?.channel && Array.isArray(json.rss.channel?.item)
    if (!isValidXml) return
    const a = new Set()
    for (const item of json.rss.channel.item) {
      a.add(item.category)
      if (item.category !== 'Anime') continue
      if (!this.#isAcceptedTitle(item.description)) continue
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      yield {
        title: item.title,
        link: this.torrentService.infoHashToMagnet(item['nyaa:infoHash']),
        date: DateFormatter.toDate(dateIgnoreWeekday, 'DD MMM YYYY HH:mm:ss ZZ'),
      }
    }

    logger.info('Extractor TokyoTosho -> end')
  }
}
