import fs from 'fs-extra';
import { basename, resolve } from 'path';
import walkFiles from 'walk-asyncgen';
import extractData from './src/extract-data';
import applyWetTransforms from './src/wetTransforms';
import {
	buildToc,
	buildTOMTitleLink,
	buildNav,
	buildSecMenu,
	buildBreadcrumbs,
} from './src/build-components';

const tomsPath = `\\\\omega\\natdfs\\Services\\Central_storage\\Testing_ABSB_Secure\\IND\\`;

const oldOutputPath = 'cache/wet2/';
const newOutputPath = 'cache/wet4/';

(async () => {
	const tomRegex = /TOM(?!409231)/;
	const wet4TomsRegex = /TOM(?!54|9990|1990|3550)/;
	const cachedTomsRegex =
		/TOM(?!19(?:10|11|13|14|15|20|21|23|24|28|40|50|60|70|80)|2000|3020|3990|191030|40(?:31|32(?:8|15)?|33|41|82|91|92[123]?|95|96|108|109|1010|1011|1056|4640|4650)|432027|432829|4340|4700|4800|56|57|9000|9010|9020|9540|9570|9810|9811|9812|9813|9815|9816|9830|9840|9850|9860)$/;
	const tomNames = (await fs.readdir(tomsPath))
		.filter((tomPath) => tomRegex.test(tomPath) && wet4TomsRegex.test(tomPath));

	for (const tomName of tomNames) {
		console.log(`caching ${tomName}`);
		const dirPath = resolve(tomsPath, tomName);
		const opts = {
			excludeDirs: new RegExp(`Draft|donezo|test|Verified|images|docs|pdf|wet40|old|archive`, 'i'),
			includeExt: /\.html/
		};

		const oldTomData = {};
		const newTomData = {};

		try {
			const pathIterator = walkFiles(dirPath, opts);

			for await (const filePath of pathIterator) {
				try {
					const fileContents = await fs.readFile(filePath, 'utf8');
					const fileData = extractData(fileContents);

					// Verify that file isn't an empty string or other falsy value
					if (!fileData) {
						console.error('No data for ' + filePath);
					} else {
						const fileKey = filePath.replace(tomsPath, '');

						oldTomData[fileKey] = fileData;
						newTomData[fileKey] = await convertData(fileData, filePath);
					}
				} catch (e) {
					console.error(`error in ${basename(filePath)}`);
					console.error(e);
				}
			}
			fs.outputJSON(resolve(oldOutputPath, `${tomName}.json`), oldTomData);
			fs.outputJSON(resolve(newOutputPath, `${tomName}.json`), newTomData);
			console.log(`outputting ${tomName}.json`);
		} catch (e) {
			console.error(e);
		}
	}
})().then(() => console.log('donezo!'));

async function convertData(fileData, filePath) {
	const { isHomepage, manualId } = fileData.metadata;
	const content = await applyWetTransforms(fileData.content, basename(filePath), isHomepage, manualId);

	const toc = buildToc(fileData.toc, fileData.metadata.language);
	const tomTitleLink = buildTOMTitleLink(fileData.breadcrumbs);
	const nav = buildNav(fileData.nav, fileData.metadata.language, fileData.tomNumber);
	const secMenu = buildSecMenu(fileData.secMenu, fileData.metadata.language, tomTitleLink, fileData.metadata.isHomepage);
	const breadcrumbs = buildBreadcrumbs(fileData.breadcrumbs, fileData.pageTitle, fileData.metadata.isHomepage);

	return {
		...fileData,
		content,
		toc,
		nav,
		secMenu,
		breadcrumbs,
	}
}