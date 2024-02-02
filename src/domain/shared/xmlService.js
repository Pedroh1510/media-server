import { XMLBuilder } from 'fast-xml-parser';
import DateFormatter from '../../utils/dateFormatter.js';
import CONFIG from '../../infra/config.js';

export default class XmlService {
	constructor() {}

	#makeBody(itens) {
		return {
			rss: {
				'@_xmlns:atom': 'http://www.w3.org/2005/Atom',
				'@_xmlns:nyaa': 'https://nyaa.si/xmlns/nyaa',
				'@_version': '2.0',
				channel: {
					title: 'Nyaa - Home - Torrent File RSS',
					description: 'RSS Feed for Home',
					link: `http://localhost:${CONFIG.port}/`,
					'atom:link': {
						'@_href': `http://localhost:${CONFIG.port}`,
						'@_rel': 'self',
						'@_type': 'application/rss+xml'
					},
					language: 'en',
					item: itens
				}
			}
		};
	}

	#makeItem({ magnet, page, pubDate, title, id }) {
		const dateFormatted = DateFormatter.format(
			pubDate,
			'ddd, DD MMM YYYY HH:mm:ss -0000'
		);
		return {
			title,
			// link: page,
			link: magnet,
			guid: {
				'#text': page
			},
			//Sat, 11 Nov 2023 11:47:01 -0000
			// pubDate: `Fri, 10 Nov 2023 16:28:00 -0000`,
			pubDate: dateFormatted,
			'nyaa:seeders': 1,
			'nyaa:leechers': 18,
			'nyaa:downloads': 0,
			'nyaa:infoHash': id,
			'nyaa:categoryId': '1_2',
			'nyaa:category': 'Anime - English-translated',
			'nyaa:size': '249.0 MiB',
			'nyaa:comments': 0,
			'nyaa:trusted': 'No',
			'nyaa:remake': 'No',
			description:
				'<a href="https://nyaa.si/view/1741283">#1741283 | 私にだけテンパる上司の話 第01-02巻</a> | 249.0 MiB | Literature - Raw | 4403A1C9A781FDD47E2F33914D599569CA05DA95'
		};
	}

	/**
	 * @param {Object} param
	 * @param {{page:String,id:String,title:String}[]} param.items
	 * @returns {String}
	 */
	buildToRss({ items }) {
		const builder = new XMLBuilder({
			// arrayNodeName: 'item',
			ignoreAttributes: false,
			// preserveOrder: true,
			format: true
		});
		return builder.build(
			this.#makeBody(items.map((item) => this.#makeItem({ ...item })))
		);
	}
}
