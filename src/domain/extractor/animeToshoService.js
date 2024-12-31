import { animeToshoApi } from '../../infra/service/apiService.js'
import DateFormatter from '../../utils/dateFormatter.js'
import logger from '../../utils/logger.js'
import TorrentService from '../shared/torrentService.js'
import XmlService from '../shared/xmlService.js'
import ExtractorRepository from './extractorRepository.js'

export default class AnimeToshoService {
  constructor() {
    this.xmlService = new XmlService()
    this.torrentService = new TorrentService()
    this.repository = new ExtractorRepository()
    this.acceptedTags = []
  }

  /**
   * @param {string} term
   */
  async #searchXml(term = undefined) {
    return animeToshoApi
      .get('', {
        params: {
          only_tor: '1',
          reversepolarity: 1,
          q: term,
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
    const titleLow = title.toLowerCase()
    return this.acceptedTags.some((tag) => titleLow.includes(tag))
  }

  #getMagnetLink(description = '') {
    const array = description.split('"')
    return array.find((item) => item.includes('magnet:'))
  }

  /**
   * @param term
   * @returns {AsyncGenerator<{title: string, link: string, date: Date}>}
   */
  async *extractor(term = undefined) {
    logger.info('Extractor AnimeTosho -> start')
    const xml = await this.#searchXml(term)
    if (!xml) {
      logger.info('Extractor AnimeTosho -> end')
      return
    }
    const json = this.xmlService.parserToJson(xml)
    const isValidXml = json?.rss && json.rss?.channel && Array.isArray(json.rss.channel?.item)
    if (!isValidXml) {
      logger.info('Extractor AnimeTosho -> end')
      return
    }
    const { accepted } = await this.repository.listTags()
    this.acceptedTags = accepted.map((item) => item.tag)
    for (const item of json.rss.channel.item) {
      if (!this.#isAcceptedTitle(item.title)) continue
      if (!this.#getMagnetLink(item.description)) continue
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      const link = this.torrentService.infoHashToMagnet(item['nyaa:infoHash'])
      try {
        await this.torrentService.magnetInfo(link)
      } catch {
        continue
      }
      yield {
        title: item.title,
        link,
        date: DateFormatter.toDate(dateIgnoreWeekday, 'DD MMM YYYY HH:mm:ss ZZ'),
      }
    }

    logger.info('Extractor AnimeTosho -> end')
  }
}
