import express from 'express';
import ExtractorService from './extractorService.js';

const extractorRouter = express();

const extractorService = new ExtractorService();

extractorRouter.get('/scan', async (req, res) => {
	await extractorService.scan(req.query);
	res.send('ok');
});
export default extractorRouter;
