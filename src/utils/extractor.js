import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';

const prisma = new PrismaClient();

const process = async (url, mapa = new Set()) => {
	const a = await axios
		.get(url)
		.then((res) => res.data)
		.catch((e) => {
			throw e.message;
		});
	const html = cheerio.load(a);
	const pageDate = html('body > h3').text();
	const blocks = html('body > div');
	blocks.each(function () {
		const hour = html(this).text();
		const aTags = html(this).find('a');
		const p = aTags
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
		if (p.length !== 2) {
			return;
		}
		if (p[1].trim() === '') {
			return;
		}
		const text = p[1].toLowerCase();
		if (text.includes('pt-bt') || text.includes('por-br')) {
			mapa.add({
				title: p[1],
				link: p[0],
				pubDate: pageDate,
				hour
			});
		}
	});
	const next = html('body > p:nth-child(3) > a:nth-child(2)').attr('href');
	return { next };
};
const save = async (data) => {
	for (const item of data) {
		const date = item.pubDate.substring(0, 10);
		const hour = item.hour.substring(0, 5);
		const dateFormatted = new Date(`${date} ${hour}:00:000z`);
		await prisma.torrent
			.create({
				data: {
					title: item.title,
					magnet: item.link,
					pubDate: dateFormatted
				}
			})
			.catch((err) => console.error(`error -- ${err.message}`));
	}
};

export const extractor = async (total = 1000) => {
	const urlBase = 'https://magnets.moe';
	let url = `${urlBase}/new`;

	const mapa = new Set();
	for (let index = 0; index < total; index++) {
		console.log(index);
		mapa.clear();
		let newurl = '';
		try {
			const { next } = await process(url, mapa);
			if (next) newurl = next;
			await save([...mapa]);
		} catch (e) {
			console.log(e);
			continue;
		}
		if (!newurl) {
			break;
		}
		url = `${urlBase}${newurl}`;
	}
	// await prisma.$disconnect();
};
