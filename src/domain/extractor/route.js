import express from 'express';
import ExtractorService from './extractorService.js';

const extractorRouter = express();

const extractorService = new ExtractorService();

extractorRouter.get('/scan', async (req, res) => {
	await extractorService.scan(req.query);
	res.send('ok');
});
extractorRouter.get('/scan-all', async (req, res) => {
	req.setTimeout(0)
	const total = await extractorService.scanFull();
	res.send({total});
});
export default extractorRouter;
