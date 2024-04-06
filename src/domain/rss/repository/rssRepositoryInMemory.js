export default class RssRepositoryInMemory {
  torrent = []
  async list() {
    return this.torrent
  }

  async listAll() {
    return this.torrent
  }

  async count() {
    return this.torrent.length
  }
}
