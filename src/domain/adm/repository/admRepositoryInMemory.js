export default class AdmRepositoryInMemory {
  torrent = []
  verifyTags = []
  acceptedTags = []
  async *listAll() {
    for (const item of this.torrent) {
      yield item
    }
  }

  async count() {
    return this.torrent.length
  }

  async insert({ magnet, pubDate, title }) {
    this.torrent.push({ magnet, pubDate, title })
  }

  async deleteAll() {
    this.torrent = []
  }

  async insertAcceptedTags(data) {
    this.acceptedTags.push(data)
  }

  async insertVerifyTags(data) {
    this.verifyTags.push(data)
  }

  async listAcceptedTags() {
    return this.acceptedTags
  }

  async listVerifyTags() {
    return this.verifyTags
  }
}
