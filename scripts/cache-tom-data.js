import fs from 'fs-extra';
import { basename, resolve } from 'path';
import walkFiles from 'walk-asyncgen';
import { formatHtml } from '../src/util';
import extractData from '../src/extract-data';
import applyWetTransforms from '../src/wetTransforms/index';
import {
	buildToc,
	buildTOMTitleLink,
	buildNav,
	buildSecMenu,
	buildBreadcrumbs,
} from '../src/build-components';

const tomsPath = `\\\\omega\\natdfs\\Services\\Central_storage\\Testing_ABSB_Secure\\IND\\`;

const oldOutputPath = 'cache/wet2/';
const newOutputPath = 'cache/wet4/';

const startTime = Date.now();

(async () => {
	const tomRegex = new RegExp(`TOM${process.argv.length > 2 ? process.argv.slice(2).join('|') : ''}`);
	const wet4TomsRegex = /TOM(?!54|9990|1990|3550)/;
	const tomNames = (await fs.readdir(tomsPath))
		.filter((tomPath) => tomRegex.test(tomPath) && wet4TomsRegex.test(tomPath) && !tomsToSkip.includes(tomPath));

	for (const tomName of tomNames) {
		console.log(`caching ${tomName}`);
		const dirPath = resolve(tomsPath, tomName);
		const opts = {
			excludeDirs: new RegExp(`Draft|donezo|test|Verified|images|docs|pdf|wet40|old|archive`, 'i'),
			includeExt: /\.html/
		};

		try {
			const pathIterator = walkFiles(dirPath, opts);

			const oldCachePath = resolve(oldOutputPath, `${tomName}.json`);
			const newCachePath = resolve(newOutputPath, `${tomName}.json`);

			const oldTomData = (await fs.exists(oldCachePath)) ? (await fs.readJSON(oldCachePath)) : {};
			const newTomData = (await fs.exists(newCachePath)) ? (await fs.readJSON(newCachePath)) : {};

			for await (const filePath of pathIterator) {
				//if (await checkIfOutdated(filePath, dirPath)) {
				//	console.log(`${filePath} is outdated. Updating.`);
					try {
						const fileContents = await fs.readFile(filePath, 'utf8');
						const fileData = extractData(fileContents);

						// Verify that file isn't an empty string or other falsy value
						if (!fileData) {
							console.error(`No data for ${filePath}`);
						} else {
							const fileKey = filePath.replace(tomsPath, '');

							oldTomData[fileKey] = fileData;
							newTomData[fileKey] = await convertData(fileData, filePath);
						}
					} catch (e) {
						console.error(`error in ${basename(filePath)}`);
						console.error(e);
					}
				//}
			}
			fs.outputJSON(oldCachePath, oldTomData);
			fs.outputJSON(newCachePath, newTomData);
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

export async function convertData(fileData, filePath) {
	const { isHomepage, manualId } = fileData.metadata;
	const content = await applyWetTransforms(fileData.content, basename(filePath), isHomepage, manualId);

	const toc = buildToc(fileData.toc, fileData.metadata.language);
	const tomTitleLink = buildTOMTitleLink(fileData.breadcrumbs);
	const nav = buildNav(fileData.nav, fileData.metadata.language, fileData.tomNumber);
	const secMenu = buildSecMenu(fileData.secMenu, fileData.metadata.language, tomTitleLink, fileData.metadata.isHomepage);
	const breadcrumbs = buildBreadcrumbs(fileData.breadcrumbs, fileData.pageTitle, fileData.metadata.isHomepage);

	return {
		...fileData,
		content: formatHtml(content),
		toc,
		nav,
		secMenu,
		breadcrumbs,
	}
}

async function checkIfOutdated(filePath, dirPath) {
	const cachePath = resolve('cache/wet2/', `${basename(dirPath)}.json`);
	const cacheDate = (await fs.stat(cachePath)).mtimeMs;
	const fileModifiedDate = (await fs.stat(filePath)).mtimeMs;

	return cacheDate > fileModifiedDate;
}