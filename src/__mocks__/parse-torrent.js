const parseTorrent = jest.fn().mockResolvedValue({ infoHash: 'mockhash' });
const toMagnetURI = jest.fn().mockReturnValue('magnet:?xt=urn:btih:mockhash');
module.exports = { default: parseTorrent, toMagnetURI };
