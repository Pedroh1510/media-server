import { qBittorrentClient as QBittorrent } from '@robertklep/qbittorrent'

import logger from '../../utils/logger.js'
import CONFIG from '../config.js'
export default class BittorrentService {
  #client = new QBittorrent(CONFIG.urlTorrent, CONFIG.userTorrent, CONFIG.passTorrent)

  /**
   * @returns {Promise<{hash: string, dateCompleted: Date, name: string}[]>}
   */
  async listTorrentsConcluded() {
    logger.info(`Listing torrents concluded ${CONFIG.urlTorrent} - ${CONFIG.userTorrent} - ${CONFIG.passTorrent}`)
    const list = await this.#client.torrents.info()
    return list
      .map((item) => ({
        ...item,
        dateCompleted: new Date(item.completion_on * 1000),
      }))
      .filter(({ dateCompleted }) => dateCompleted.getFullYear() >= 2024)
  }

  async deleteTorrents(listHashes) {
    await this.#client.torrents.delete(listHashes, true)
  }

  async stopTorrents(listHashes) {
    await this.#client.torrents.pause(listHashes)
  }
}
