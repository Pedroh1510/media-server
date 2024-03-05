import logger from '../../utils/logger.js'
import TorrentService from '../shared/torrentService.js'
import AnimeToshoService from './animeToshoService.js'
import ExtractorRepository from './extractorRepository.js'
import MoeService from './moeService.js'
import NyaaService from './nyaaService.js'

export default class ExtractorService {
  constructor() {
    this.repository = new ExtractorRepository()
    this.moeService = new MoeService()
    this.nyaaService = new NyaaService()
    this.animeToshoService = new AnimeToshoService()
    this.torrentService = new TorrentService()
  }

  /**
   * @param {AsyncGenerator<{title: string, link: string, date: Date}>} asyncGeneratorFn
   */
  async #executeExtractor(asyncGeneratorFn) {
    let counter = 0
    for await (const item of asyncGeneratorFn()) {
      try {
        await this.torrentService.magnetInfo(item.link)
        await this.repository.save(item)
        counter++
      } catch (error) {}
    }
    return counter
  }

  /**
   *
   * @param {object} param
   * @param {string} param.total
   * @returns {Promise<void>}
   */
  async scan({ total }) {
    logger.info(`scan -> with total ${total}`)

    const responses = await Promise.all([
      this.#executeExtractor(() => this.moeService.extractor(total)),
      this.#executeExtractor(() => this.nyaaService.extractor(undefined, true)),
      this.#executeExtractor(() => this.animeToshoService.extractor()),
    ])

    logger.info(`scan -> end ${responses.reduce((p, c) => p + c, 0)}`)
  }

  async scanFull() {
    logger.info('scanFull -> start')

    const responses = await Promise.all([
      this.#executeExtractor(() => this.moeService.extractor()),
      this.#executeExtractor(() => this.moeService.extractorAll()),
      this.#executeExtractor(() => this.nyaaService.extractor(undefined, true)),
      this.#executeExtractor(() => this.animeToshoService.extractor()),
    ])

    const total = responses.reduce((p, c) => p + c, 0)
    logger.info(`scanFull -> end ${total}`)
    return total
  }

  async extractorRss(query) {
    if (!query) return
    logger.info('extractorRss -> start')
    const responses = await Promise.all([
      this.#executeExtractor(() => this.nyaaService.extractor(query)),
      this.#executeExtractor(() => this.animeToshoService.extractor(query)),
    ])
    logger.info(`extractorRss -> end ${responses.reduce((p, c) => p + c, 0)}`)
  }
}
