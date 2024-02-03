import { CronJob } from 'cron';

import AdmService from './domain/adm/admService.js';
import ExtractorService from './domain/extractor/extractorService.js';
import logger from './utils/logger.js';

const admService = new AdmService();
const extractorService = new ExtractorService();

export default function jobs() {
	logger.info('start jobs')
	new CronJob(
		'30 * * * *', // cronTime
		async function () {
			logger.info('startCron');
			await extractorService.scan({ total: 5 }).catch(() => {});
			logger.info('endCron');
		}, // onTick
		null, // onComplete
		true, // start
		'America/Los_Angeles' // timeZone
	);
	new CronJob(
		'0 * * * *', // cronTime
		async function () {
			logger.info('startCron');
			try {
				await admService.deleteFiles();
			} catch {}
			logger.info('endCron');
		}, // onTick
		null, // onComplete
		true, // start
		'America/Los_Angeles' // timeZone
	);
}
