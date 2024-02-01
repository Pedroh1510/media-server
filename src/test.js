import axios from 'axios';
import cheerio from 'cheerio';
import { XMLBuilder } from 'fast-xml-parser';
import fs from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
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
			console.log(1);
		} else {
			if (p[1].trim() === '') {
				console.log(2);
			}
			const text = p[1].toLowerCase();
			if (text.includes('pt-bt') || text.includes('por-br')) {
				mapa.add({
					title: p[1],
					type: 'public',
					link: p[0],
					pubDate: pageDate,
					hour,
					category: [8000, 100016],
					seeders: 1,
					guid: {
						'#text': p[0]
						// '@_isPermaLink': true
					},
					'torznab:attr': [
						{
							'@_name': 'category',
							'@_value': '8000'
						},
						{
							'@_name': 'category',
							'@_value': '100016'
						},
						{
							'@_name': 'genre',
							'@_value': ''
						},
						{
							'@_name': 'seeders',
							'@_value': '0'
						},
						{
							'@_name': 'peers',
							'@_value': '1'
						},
						{
							'@_name': 'infohash',
							'@_value': '7K524XAY6V36YKCUOG5E7FNGD4A6TUEI'
						},
						{
							'@_name': 'magneturl',
							'@_value': p[0]
						},
						{
							'@_name': 'downloadvolumefactor',
							'@_value': '0'
						},
						{
							'@_name': 'uploadvolumefactor',
							'@_value': '1'
						}
					]
					// date: pageDate,
					// hour: hour.split(' ')[0]
				});
				// mapa.set(p[1], {
				//   name:p[1],
				// 	magnet: p[0],
				// 	date: pageDate,
				// 	hour: hour.split(' ')[0]
				// });
			}
		}
	});
	const next = html('body > p:nth-child(3) > a:nth-child(2)').attr('href');
	return { next };
};

/**
 * @param {Array} data
 * @return {String}
 */
const buildXml = (data) => {
	const builder = new XMLBuilder({
		// arrayNodeName: 'item',
		ignoreAttributes: false,
		// preserveOrder: true,
		format: true
	});
	const dataFormatted = {
		'?xml': {
			'@_version': '1.0',
			'@_encoding': 'UTF-8'
		},
		rss: {
			'@_version': '2.0',
			'@_xmlns:atom': 'http://www.w3.org/2005/Atom',
			'@_xmlns:newznab': 'http://www.newznab.com/DTD/2010/feeds/attributes/',
			'@_xmlns:torznab': 'http://torznab.com/schemas/2015/feed',
			channel: {
				'atom:link': {
					'@_href': 'http://192.168.0.19:4000/',
					'@_rel': 'self',
					'@_type': 'application/rss+xml'
				},
				title: 'Local',
				description:
					'Anidex is a Public torrent tracker and indexer, primarily for English fansub groups of anime',
				link: 'http://192.168.0.19:4000/',
				language: 'pt-BR',
				category: 'search',
				item: data
			}
		}
	};
	return builder.build(dataFormatted);
};

/**
 *
 * @param {{title:String, link:String,pubDate:String, hour:String}[]} data
 */
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
(async () => {
	const urlBase = 'https://magnets.moe';
	let url = `${urlBase}/new`;

	const mapa = new Set();
	for (let index = 0; index < 300; index++) {
		console.log(index);
		mapa.clear();
		const { next } = await process(url, mapa);
		await save([...mapa]);
		if (!next) {
			break;
		}
		url = `${urlBase}${next}`;
	}
	await prisma.$disconnect();
	// const xml = buildXml([...mapa]);
	// await fs.writeFile('./test.xml', xml);
	// console.log(mapa);
})();
