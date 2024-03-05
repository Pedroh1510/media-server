import { PassThrough, Readable, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import BittorrentService from '../../infra/service/bittorrentService.js'
import DateFormatter from '../../utils/dateFormatter.js'
import logger from '../../utils/logger.js'
import CsvService from '../shared/csvService.js'
import AdmRepository from './admRepository.js'

export default class AdmService {
  #repository = new AdmRepository()
  #csvService = new CsvService()
  constructor() {
    this.bittorrentService = new BittorrentService()
  }

  async deleteFiles() {
    const listTorrents = await this.bittorrentService.listTorrentsConcluded()
    logger.info(`Total de torrents concluidos ${listTorrents.length}`)
    await this.bittorrentService.stopTorrents(listTorrents.map(({ hash }) => hash))

    const maxHourLifeTime = 2
    const listTorrentsConcludedExpired = listTorrents.filter(
      (item) => DateFormatter.diff(Date.now(), item.dateCompleted, 'hour') > maxHourLifeTime
    )

    logger.info(`Total de torrents concluidos expirados(${maxHourLifeTime}h): ${listTorrentsConcludedExpired.length}`)
    if (!listTorrentsConcludedExpired.length)
      return { total: listTorrents.length, totalDeleted: listTorrentsConcludedExpired.length }
    await this.bittorrentService.deleteTorrents(listTorrentsConcludedExpired.map((item) => item.hash))
    return {
      total: listTorrents.length,
      totalDeleted: listTorrentsConcludedExpired.length,
      deleled: listTorrentsConcludedExpired.map(({ name }) => name),
    }
  }

  exportData() {
    const read = Readable.from(this.#repository.listAll())
    return {
      fileName: 'data.csv',
      stream: read
        .pipe(this.#csvService.jsonToCsvStream({ streamData: read, objectMode: true }))
        .pipe(new PassThrough()),
    }
  }

  async deleteRss() {
    await this.#repository.deleteAll()
  }

  /**
   *
   * @param {Object} param
   * @param {Readable} param.fileStream
   */
  async importData({ fileStream }) {
    let totalInserted = 0
    await pipeline(
      fileStream,
      this.#csvService.csvToJson(),
      new Writable({
        objectMode: true,
        write: async (c, _, cb) => {
          await this.#repository
            .insert(c)
            .then(() => totalInserted++)
            .catch(() => {})
          cb(null)
        },
      })
    )
    return { totalInserted }
  }

  /**
   *
   * @param {Object} param
   * @param {String[]} param.acceptedTags
   * @param {String[]} param.verifyTags
   */
  async insertTags({ acceptedTags, verifyTags }) {
    if (acceptedTags && acceptedTags.length) {
      if (!Array.isArray(acceptedTags)) throw new Error('acceptedTags deve ser um array')
      if (!acceptedTags.length) throw new Error('acceptedTags n deve ser vazio')
      await this.#repository.insertAcceptedTags(acceptedTags.map((tag) => ({ tag }))).catch(() => {})
    }
    if (verifyTags && verifyTags.length) {
      if (!Array.isArray(verifyTags)) throw new Error('verifyTags deve ser um array')
      if (!verifyTags.length) throw new Error('verifyTags n deve ser vazio')
      await this.#repository.insertVerifyTags(verifyTags.map((tag) => ({ tag }))).catch(() => {})
    }
  }

  async listTags() {
    return {
      verifyTags: await this.#repository.listVerifyTags(),
      acceptedTags: await this.#repository.listAcceptedTags(),
    }
  }
}
