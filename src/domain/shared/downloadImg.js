import axios from 'axios'

export default class DownloadImageService {
  async getStream(url) {
    const imageStream = await axios
      .get(url, {
        responseType: 'stream',
      })
      .then((response) => response.data)
    return imageStream
  }

  async getBuffer(url, headers = {}) {
    const { origin } = new URL(url)
    return axios
      .get(url, {
        headers: {
          Referer: origin,
          ...headers,
        },
        responseType: 'arraybuffer',
      })
      .then((response) => response.data)
  }
}
