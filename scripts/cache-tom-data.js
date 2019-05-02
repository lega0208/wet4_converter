import fs from 'fs-extra';
import { basename, resolve } from 'path';
import walkFiles from 'walk-asyncgen';
import extractData from '../src/extract-data';

const tomsPath = `\\\\omega\\natdfs\\Services\\Central_storage\\Testing_ABSB_Secure\\IND\\`;
const outputPath = 'cache/';
const startTime = Date.now();

(async () => {
	const tomRegex =
		new RegExp(`TOM(?!54|9990|1990|3550)${
			process.argv.length > 2 // check if any manuals are specified in argv
				? process.argv.slice(2).join('|')
				: ''
		}`);

	const tomNames = (await fs.readdir(tomsPath))
		.filter((tomPath) => tomRegex.test(tomPath));

	const walkOpts = {
		excludeDirs: new RegExp(`Draft|donezo|test|Verified|images|docs|pdf|wet40|old|archive`, 'i'),
		includeExt: /\.html/
	};

	for (const tomName of tomNames) {
		console.log(`caching ${tomName}`);
		const tomData = {};
		const dirPath = resolve(tomsPath, tomName);

		try {
			const pathIterator = walkFiles(dirPath, walkOpts);

			const cacheFileOutputPath = resolve(outputPath, `${tomName}.json`);

			for await (const filePath of pathIterator) {
				try {
					const fileContents = await fs.readFile(filePath, 'utf8');
					const fileData = extractData(fileContents);

					// Verify that file isn't an empty string or other falsy value
					if (!fileData) {
						console.error(`No data for ${filePath}`);
					} else {
						const fileKey = filePath.replace(tomsPath, '');

						tomData[fileKey] = fileData;
					}
				} catch (e) {
					console.error(`error in ${basename(filePath)}`);
					console.error(e);
				}
			}
			fs.outputJSON(cacheFileOutputPath, tomData);
			console.log(`outputting ${tomName}.json`);
		} catch (e) {
			console.error(e);
		}
	}
})().then(() => {
	const endTime = Date.now();
	console.log('donezo!');
	console.log(`Caching finished in ${(new Date(endTime - startTime)).getMinutes()} minutes`);
});