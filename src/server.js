import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
	buildXml,
	deleteCompletedDownloads,
	formatTitle,
	magnetInfo
} from './utils/funtions.js';
import { makeBody, makeItem } from './utils/constants.js';
import { extractor } from './utils/extractor.js';
const prisma = new PrismaClient();

const server = express();
server.get('/', async (req, res) => {
	const { term } = req.query;
	const take = term ? undefined : 10000;
	const where = !term
		? undefined
		: {
				title: {
					contains: term.split(/s\d/)[0].trim()
				}
		  };
	console.log({ take, where, term, query: req.query });
	const response = await prisma.torrent.findMany({
		take,
		where,
		orderBy: {
			pubDate: 'desc'
		}
	});
	const itens = [];
	for (const item of response) {
		itens.push(
			makeItem({
				...item,
				page: `http://192.168.0.19:4000/${item.id}`,
				id: await magnetInfo(item.magnet),
				title: formatTitle(item)
			})
		);
	}
	const body = makeBody(itens);
	res.header('Content-Type', 'application/xml');
	res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
	return res.send(buildXml(body)).end();
});

server.get('/all', async (_req, res) => {
	const response = await prisma.torrent.findMany({
		orderBy: {
			pubDate: 'desc'
		}
	});
	res.send(response);
});

// server.get('/delete', async (_req, res) => {
// 	await prisma.torrent.deleteMany();
// 	res.send('ok');
// });

server.get('/scan', async (req, res) => {
	const { total } = req.query;
	await extractor(total);
	console.log('finished scan');
	res.send('ok');
});
server.get('/delete', async (_req, res) => {
	await deleteCompletedDownloads();
	console.log('finished delete');
	res.send('ok');
});

const port = process.env.port || 3000;
server.listen(port, () => console.log(`listen ${port}`));
import { CronJob } from 'cron';
const job = new CronJob(
	'30 * * * *', // cronTime
	async function () {
		console.log('startCron');
		await extractor(5).catch((e) => {});
		console.log('endCron');
	}, // onTick
	null, // onComplete
	true, // start
	'America/Los_Angeles' // timeZone
);
new CronJob(
	'0 23 * * *', // cronTime
	async function () {
		console.log('startCron');
		try {
			await deleteCompletedDownloads();
		} catch {}
		console.log('endCron');
	}, // onTick
	null, // onComplete
	true, // start
	'America/Los_Angeles' // timeZone
);
