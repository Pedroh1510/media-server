import CONFIG from '../../infra/config.js';
import TorrentService from '../shared/torrentService.js';
import XmlService from '../shared/xmlService.js';
import RssRepository from './rssRepository.js';

export default class RssService {
	constructor() {
		this.repository = new RssRepository();
		this.xmlService = new XmlService();
		this.torrentService = new TorrentService();
	}
	async list({ term = undefined }) {
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
		// console.log(title.match(/\dnd Season - (\d){2}/));
		title = title + '[POR]';
		if (result !== null) {
			const q = result[0];
			const ep = q.split(' - ').pop();
			const session = q.split('nd').shift();
			// console.log({ep,session});>?
			// return title.replace(reg, ` - Season ${session} - ${ep}`);
			// return title.replace('Season -', `Season - 2`);
			return title.replace(q, `${result[0]} - ${session}x${ep}`);
		}
		return title;
	}
}
