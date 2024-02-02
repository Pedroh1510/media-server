import { CronJob } from 'cron';

import AdmService from './domain/adm/admService.js';
import ExtractorService from './domain/extractor/extractorService.js';

const admService = new AdmService();
const extractorService = new ExtractorService();

export default function jobs() {
	new CronJob(
		'30 * * * *', // cronTime
		async function () {
			console.log('startCron');
			await extractorService.scan({ total: 5 }).catch(() => {});
			console.log('endCron');
		}, // onTick
		null, // onComplete
		true, // start
		'America/Los_Angeles' // timeZone
	);
	new CronJob(
		'0 * * * *', // cronTime
		async function () {
			console.log('startCron');
			try {
				await admService.deleteFiles();
			} catch {}
			console.log('endCron');
		}, // onTick
		null, // onComplete
		true, // start
		'America/Los_Angeles' // timeZone
	);
}
