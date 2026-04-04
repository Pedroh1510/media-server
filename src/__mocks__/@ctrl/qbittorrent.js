const QBittorrent = jest.fn().mockImplementation(() => ({
  getAllData: jest.fn(),
  removeTorrent: jest.fn().mockResolvedValue(undefined),
  stopTorrent: jest.fn().mockResolvedValue(undefined),
}))

module.exports = { QBittorrent }
