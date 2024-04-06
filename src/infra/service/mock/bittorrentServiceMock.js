export default class BittorrentServiceMock {
  returns = {
    listTorrentsConcluded: [],
  }

  /**
   * @returns {Promise<{hash: string, dateCompleted: Date, name: string}[]>}
   */
  async listTorrentsConcluded() {
    return this.returns.listTorrentsConcluded
  }

  async deleteTorrents() {}

  async stopTorrents() {}
}
