import axios from 'axios'
import { load } from 'cheerio'

import { nyaaApi } from '../../infra/service/apiService.js'
import DateFormatter from '../../utils/dateFormatter.js'
import logger from '../../utils/logger.js'
import TorrentService from '../shared/torrentService.js'
import XmlService from '../shared/xmlService.js'
import ExtractorRepository from './extractorRepository.js'

export default class NyaaService {
  constructor() {
    this.xmlService = new XmlService()
    this.torrentService = new TorrentService()
    this.repository = new ExtractorRepository()
    this.acceptedTags = []
    this.verifyTags = []
  }

  /**
   * @param {string} term
   */
  async #searchXml(term) {
    return nyaaApi
      .get('/', {
        params: {
          page: 'rss',
          c: '1_0',
          q: term,
        },
      })
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
    return this.acceptedTags.some((tag) => title.toLowerCase().includes(tag))
  }

  isVerify(text) {
    return this.verifyTags.some((tag) => text.toLowerCase().includes(tag))
  }

  /**
   * @param {string} term
   * @param {boolean} processAllItems
   * @returns {AsyncGenerator<{title: string, link: string, date: Date}>}
   */
  async *extractor(term, processAllItems = false) {
    logger.info('Extractor Nyaa -> start')
    const xml = await this.#searchXml(term)
    if (!xml) return
    const json = this.xmlService.parserToJson(xml)
    const isValidXml = json?.rss && json.rss?.channel && Array.isArray(json.rss.channel?.item)
    if (!isValidXml) return
    const { accepted, verify } = await this.repository.listTags()
    this.verifyTags = verify.map((item) => item.tag)
    this.acceptedTags = accepted.map((item) => item.tag)
    const isVerify = (text) => this.verifyTags.some((tag) => text.toLowerCase().includes(tag))
    const promises = []
    const processItem = async (item) => {
      if (!this.#isAcceptedTitle(item.title)) {
        if (!isVerify(item.title) && !processAllItems) return null
        const isValid = await this.isAcceptInNyaa(item.link)
        if (!isValid) return null
      }
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      const link = this.torrentService.infoHashToMagnet(item['nyaa:infoHash'])
      try {
        await this.torrentService.magnetInfo(link)
      } catch (error) {
        return null
      }

      return {
        title: item.title,
        link: this.torrentService.infoHashToMagnet(item['nyaa:infoHash']),
        date: DateFormatter.toDate(dateIgnoreWeekday, 'DD MMM YYYY HH:mm:ss ZZ'),
      }
    }
    const maxParallelRequest = 1
    for (const item of json.rss.channel.item) {
      promises.push(processItem(item))
      if (promises.length >= maxParallelRequest) {
        const responses = await Promise.all(promises)
        for (const response of responses) {
          if (!response) continue
          yield response
        }
        promises.length = 0
      }

      // yield {
      //   title: item.title,
      //   link: this.torrentService.infoHashToMagnet(item['nyaa:infoHash']),
      //   date: DateFormatter.toDate(dateIgnoreWeekday, 'DD MMM YYYY HH:mm:ss ZZ'),
      // }
    }
    if (promises.length) {
      const responses = await Promise.all(promises)
      for (const response of responses) {
        if (!response) continue
        yield response
      }
    }

    logger.info('Extractor Nyaa -> end')
  }

  async isAcceptInNyaa(url) {
    try {
      const page = await axios.get(url).then((res) => res.data)
      const html = load(page)
      // const tableDescription = html('//*[@id="torrent-description"]/table/tbody');
      const tableDescription = html('#torrent-description')
      let isAccept = false
      const listTags = this.acceptedTags
      for (const item of tableDescription) {
        if (item.children.length === 1) {
          const child = item.children[0]
          if (!child?.data) continue
          const text = child.data?.toLowerCase()
          if (!text) continue
          const textSplited = text.split('\n').filter((item) => !!item)
          const subtitle = textSplited.find((item) => item.includes('subtitle'))
          if (!subtitle) continue
          if (!listTags.some((tag) => subtitle.replace(/\*/gm, '').includes(tag))) continue
          isAccept = true
          break
        }
      }
      return isAccept
    } catch (error) {
      return false
    }
  }
}
