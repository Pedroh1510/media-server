import axios from 'axios'
import parseTorrent, { toMagnetURI } from 'parse-torrent'
export default class TorrentService {
  /**
   *
   * @param {string} url
   * @returns {Promise<{infoHash: string}>}
   */
  async magnetInfo(url) {
    const data = await parseTorrent(url)
    return { infoHash: data.infoHash }
  }

  /**
   * @param {string} infoHash
   */
  infoHashToMagnet(infoHash) {
    return toMagnetURI({ infoHash })
  }

  async magnetByLinkFile(url) {
    const buffer = await getBuffer(url)
    const info = await parseTorrent(buffer)
    return toMagnetURI({
      ...info,
    })
  }
}
async function getBuffer(reqUrl) {
  const response = await axios({
    method: 'GET',
    url: reqUrl,
    responseType: 'stream',
  }).catch(() => null)
  if (!response || response.status !== 200) {
    throw new Error('Error downloading torrent')
  }
  return stream2buffer(response.data)
}

async function stream2buffer(stream) {
  return new Promise((resolve, reject) => {
    const _buf = []

    stream.on('data', (chunk) => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', (err) => reject(err))
  })
}
