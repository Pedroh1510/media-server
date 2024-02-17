import DateFormatter from '../../utils/dateFormatter.js';
import logger from '../../utils/logger.js';
import BittorrentService from '../../infra/service/bittorrentService.js';

export default class AdmService {
	constructor() {
		this.bittorrentService = new BittorrentService()
	}
	async deleteFiles() {
		const listTorrents = await this.bittorrentService.listTorrentsConcluded()
		logger.info(`Total de torrents concluidos ${listTorrents.length}`)
		const maxHourLifeTime = 2;
		
		const listTorrentsConcludedExpired = listTorrents.filter(item=>DateFormatter.diff(Date.now(), item.dateCompleted, 'hour')>maxHourLifeTime)
		
		logger.info(`Total de torrents concluidos expirados(${maxHourLifeTime}h): ${listTorrentsConcludedExpired.length}`)
		if(!listTorrentsConcludedExpired.length) return {total:listTorrents.length,totalDeleted:listTorrentsConcludedExpired.length}
		await this.bittorrentService.deleteTorrents(listTorrentsConcludedExpired.map(item=>item.hash))
		return {total:listTorrents.length,totalDeleted:listTorrentsConcludedExpired.length,deleled:listTorrentsConcludedExpired.map(({name})=>name)}
	}
}
