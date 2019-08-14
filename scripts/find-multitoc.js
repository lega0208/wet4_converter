import fs from 'fs-extra';
import { basename, resolve } from 'path';
import walkFiles from 'walk-asyncgen';
import cheerio from 'cheerio';
import extractData from '../src/extract-data';

const tomsPath = `\\\\omega\\natdfs\\Services\\Central_storage\\Testing_ABSB_Secure\\IND\\`;

(async () => {
	const tomRegex =
		new RegExp(`TOM(?!54|9990|1990|3550|401056|4200)${
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
		const dirPath = resolve(tomsPath, tomName);

		try {
			const pathIterator = walkFiles(dirPath, walkOpts);

			for await (const filePath of pathIterator) {
				try {
					const fileContents = await fs.readFile(filePath, 'utf8');
					const $ = cheerio.load(fileContents, { decodeEntities: false });

					const $tocs = $('.panel > .panel-heading > .panel-title');
					if ($tocs.length > 1) {
						console.log(filePath);
					}

				} catch (e) {
					console.error(`error in ${basename(filePath)}`);
					console.error(e);
				}
			}
		} catch (e) {
			console.error(e);
		}
	}
})().then(() => console.log('donezo!'));