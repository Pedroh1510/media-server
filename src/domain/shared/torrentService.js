import parseTorrent, { toMagnetURI } from 'parse-torrent'
export default class TorrentService {
  /**
   *
   * @param {string} url
   * @returns {Promise<{infoHash: string}>}
   */
  async magnetInfo (url) {
    const data = await parseTorrent(url)
    return { infoHash: data.infoHash }
  }

  /**
   * @param {string} infoHash
   */
  infoHashToMagnet (infoHash) {
    return toMagnetURI({ infoHash })
  }
}
