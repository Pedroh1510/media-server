import express from 'express';
import rssRouter from './domain/rss/routes.js';
import extractorRouter from './domain/extractor/route.js';
import admRouter from './domain/adm/route.js';
import CONFIG from './infra/config.js';
import jobs from './job.js';
import logger from './utils/logger.js';

const server = express();

server.use(rssRouter);

server.use(extractorRouter);

server.use(admRouter);

server.listen(CONFIG.port, () => logger.info(`listen ${CONFIG.port}`));

jobs();
