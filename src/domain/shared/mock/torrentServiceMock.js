export default class TorrentServiceMock {
  returns = {
    magnetInfo: { infoHash: '' },
    infoHashToMagnet: '',
  }

  async magnetInfo() {
    return this.returns.magnetInfo
  }

  infoHashToMagnet() {
    return this.returns.infoHashToMagnet
  }
}
