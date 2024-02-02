import { lstat, readdir, rm } from 'node:fs/promises';
import DateFormatter from '../../utils/dateFormatter.js';

export default class AdmService {
	constructor() {}
	async deleteFiles() {
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
	}
}
