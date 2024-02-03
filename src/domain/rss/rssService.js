import CONFIG from '../../infra/config.js';
import logger from '../../utils/logger.js';
import ExtractorService from '../extractor/extractorService.js';
import TorrentService from '../shared/torrentService.js';
import XmlService from '../shared/xmlService.js';
import RssRepository from './rssRepository.js';

export default class RssService {
	constructor() {
		this.repository = new RssRepository();
		this.xmlService = new XmlService();
		this.torrentService = new TorrentService();
		this.extractorService = new ExtractorService();
	}
	async list(data) {
		const  { term:q,t } = data
		let term = q??t
		if(term){
			term = term.replace(/ [sS]\d{1,4}/,'')
		}
		logger.info(`List -> with term ${term} -- ${JSON.stringify(data??{})}`)
		await this.extractorService.extractorRss({q:term})

		const response = await this.repository.list({
			term,
			limit: term ? undefined : 10000
		});

		const items = [];

		for (const item of response) {
			items.push({
				...item,
				page: `http://192.168.0.19:${CONFIG.port}}/${item.id}`,
				id: await this.torrentService.magnetInfo(item.magnet),
				title: this.#formatTitle(item)
			});
		}

		return this.xmlService.buildToRss({ items });
	}

	async listAll() {
		return this.repository.listAll();
	}

	async count() {
		return { total: await this.repository.count() };
	}

	/**
	 *
	 * @param {{title:string}} param0
	 * @returns {String}
	 */
	#formatTitle({ title }) {
		const reg = /\dnd Season - (\d){2}/;
		const result = title.match(reg);
		const titleSplitted = title.split('.')
		const extention =titleSplitted.pop()
		title = titleSplitted.join('.')+'[POR]'+`.${extention}`
		if (result !== null) {
			const q = result[0];
			const ep = q.split(' - ').pop();
			const session = q.split('nd').shift();
			title =  title.replace(q, `${result[0]} - ${session}x${ep}`);
			title = title.replace(reg,'')
			return title
		}
		return title;
	}
}
