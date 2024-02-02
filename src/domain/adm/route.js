import express from 'express';
import AdmService from './admService.js';

const admRouter = express();

const admService = new AdmService();

admRouter.get('/delete', async (_req, res) => {
	await admService.deleteFiles();
	res.send('ok');
});

export default admRouter;
