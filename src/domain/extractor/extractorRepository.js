import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger.js';

export default class ExtractorRepository {
	#prisma = new PrismaClient();
	constructor() {}

	/**
	 *
	 * @param {{title:String,link:String,date:Date}} param
	 */
	async save({ title, date, link }) {
		await this.#prisma.torrent
			.create({
				data: {
					title: title,
					magnet: link,
					pubDate: date
				}
			})
			.catch(() => {});
	}
}
