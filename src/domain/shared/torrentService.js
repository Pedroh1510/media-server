import parseTorrent, { toMagnetURI } from 'parse-torrent';
export default class TorrentService {
	constructor() {}

	/**
	 *
	 * @param {String} url
	 * @returns {Promise<{infoHash:String}>}
	 */
	async magnetInfo(url) {
			const data = await parseTorrent(url);
			return { infoHash: data.infoHash };
	}

	/**
	 *
	 * @param {String} infoHash
	 */
	 infoHashToMagnet(infoHash) {
		return toMagnetURI({infoHash:infoHash})
	}
}
