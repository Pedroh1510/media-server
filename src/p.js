import { lstat, readdir, rm } from 'node:fs/promises';
(async () => {
	const path = './downloads';
	const maxHourLifeTime = 1;
	const listFiles = await readdir(path);
	console.log(`Total files ${listFiles.length}`);
	for (const fileName of listFiles) {
		const pathFile = `${path}/${fileName}`;
		const fileInfo = await lstat(pathFile);
		if (fileInfo.isDirectory()) continue;
		const now = Date.now();
		const diff = DateFormatter.diff(now, fileInfo.ctime, 'minute');
		if (diff > maxHourLifeTime) {
			console.log(pathFile);
			// await rm(pathFile, { force: true });
		}
	}
})();
