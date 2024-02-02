import { PrismaClient } from '@prisma/client';

export default class RssRepository {
	#prisma = new PrismaClient();
	async list({ term = undefined, limit = undefined }) {
		let where = undefined;
		if (term) {
			where = {
				title: {
					contains: term.split(/s\d/)[0].trim()
				}
			};
		}

		return this.#prisma.torrent.findMany({
			take: limit,
			where,
			orderBy: {
				pubDate: 'desc'
			}
		});
	}

	async listAll() {
		return this.#prisma.torrent.findMany({
			orderBy: {
				pubDate: 'desc'
			}
		});
	}

	async count() {
		return this.#prisma.torrent.count({});
	}
}
