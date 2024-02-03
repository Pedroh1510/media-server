import axios from 'axios';
import cheerio from 'cheerio';
import logger from '../../utils/logger.js';

export default class MoeService {
	constructor() {
		this.acceptedTags = ['pt-bt', 'por-br'];
	}

	/**
	 *
	 * @param {String} url
	 * @returns {Promise<{nextUrl:String,listData:{title:String,link:String,pubDate:String,hour:String}[]}>}>}
	 */
	async #process(url) {
		const page = await axios.get(url).then((res) => res.data);
		const html = cheerio.load(page);
		const pageDate = html('body > h3').text();
		const blocks = html('body > div');

		const listData = [];
		const isAccept = (text) =>
			this.acceptedTags.some((tag) => text.includes(tag));
		blocks.each(function () {
			const hour = html(this).text();
			const pageTags = html(this).find('a');
			const paragraphs = pageTags
				.map((i, e) => {
					if (e.attribs?.href && e.attribs.href.includes('magnet')) {
						return e.attribs?.href;
					}
					if (e.children.length > 0 && e.children[0]?.data) {
						return e.children[0]?.data;
					}
					return null;
				})
				.toArray()
				.filter((e) => e !== null);
			if (paragraphs.length !== 2) {
				return;
			}
			if (paragraphs[1].trim() === '') {
				return;
			}
			const text = paragraphs[1].toLowerCase();
			if (isAccept(text)) {
				listData.push({
					title: paragraphs[1],
					link: paragraphs[0],
					pubDate: pageDate,
					hour
				});
			}
		});
		const nextUrl = html('body > p:nth-child(3) > a:nth-child(2)').attr('href');
		return { nextUrl, listData };
	}

	/**
	 * @param {{title:String,link:String,pubDate:String,hour:String}} param
	 * @returns {{title:String,link:String,date:Date}}
	 */
	#format({ hour, link, pubDate, title }) {
		const date = pubDate.substring(0, 10);
		const dateFormatted = new Date(`${date} ${hour.substring(0, 5)}:00:000z`);
		return {
			date: dateFormatted,
			link,
			title
		};
	}

	/**
	 *
	 * @param {Number} total
	 * @returns {AsyncGenerator<{title:String,link:String,date:Date}>}
	 */
	async *extractor(total) {
		const urlBase = 'https://magnets.moe';
		let url = `${urlBase}/new`;

		const mapa = new Set();
		for (let index = 0; index < total; index++) {
			mapa.clear();
			let newurl = '';
			try {
				const { nextUrl, listData } = await this.#process(url);
				if (nextUrl) newurl = nextUrl;
				for (const item of listData) {
					yield this.#format(item);
				}
			} catch (e) {
				logger.error(e);
				continue;
			}
			if (!newurl) {
				break;
			}
			url = `${urlBase}${newurl}`;
		}
	}
}
