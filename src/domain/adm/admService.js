import { PassThrough, Readable } from 'node:stream'

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
}
