import { XMLBuilder } from 'fast-xml-parser';
import parseTorrent, { toTorrentFile } from 'parse-torrent';
import Magnet2torrent from 'magnet2torrent-js';
import { lstat, readdir, rm } from 'node:fs/promises';
import DateFormatter from './dateFormatter.js';

export const buildXml = (data) => {
	const builder = new XMLBuilder({
		// arrayNodeName: 'item',
		ignoreAttributes: false,
		// preserveOrder: true,
		format: true
	});
	return builder.build(data);
};

export const magnetToTorrent = async (url) => {
	// const m2t = new Magnet2torrent({ timeout: 60 });
	// const response = await m2t.getTorrent(url);

	// return response.toTorrentFile();
	const a = await parseTorrent(url);
	// const a = await parseTorrent(url);
	const b = await toTorrentFile(a);
	console.log(b.toString());
	return b;
};
export const magnetInfo = async (url) => {
	const a = await parseTorrent(url);
	return a.infoHash;
};

/**
 *
 * @param {{title:string}} param0
 * @returns {String}
 */
export const formatTitle = ({ title }) => {
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
};

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
				pageDate,
				hour
			});
		}
	});
	const next = html('body > p:nth-child(3) > a:nth-child(2)').attr('href');
	return { next };
};

export const deleteCompletedDownloads = async () => {
	// const path = './teste';
	const path = './downloads';
	const maxHourLifeTime = 1;
	const listFiles = await readdir(path);
	console.log(`Total files ${listFiles.length}`);
	for (const fileName of listFiles) {
		const pathFile = `${path}/${fileName}`;
		const fileInfo = await lstat(pathFile);
		if (fileInfo.isDirectory()) continue;
		const now = Date.now();
		const diff = DateFormatter.diff(now, fileInfo.ctime, 'hour');
		if (diff > maxHourLifeTime) {
			console.log(pathFile);
			await rm(pathFile, { force: true });
		}
	}
};
