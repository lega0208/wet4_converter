import fs from 'fs-extra';
import { basename, dirname, relative } from 'path';
import extractData from './extract-data';
import fillTemplate from './fill-template';
import applyWetTransforms from './wetTransforms';
import finalizeFormat from './util';

export default async function convertFile(filePath, inputDir, flags = {}) {
	//console.log(filePath);
	// get data from file (string of file contents)
	const data = await fs.readFile(filePath, 'utf-8');
	// extract data to be plugged into the template
	const docData = extractData(data, filePath);
	const { isHomepage, manualId } = docData.metadata;

	//const dataLogOutputPath = `${process.env.USERPROFILE}\\Desktop\\conversion_data\\${basename(filePath)}.json`;
	//await fs.outputJSON(dataLogOutputPath, docData, {
	//	spaces: '\t',
	//	EOL: '\r\n'
	//});

	// transform html into wet4
	docData.content = finalizeFormat(await applyWetTransforms(docData.content, basename(filePath), isHomepage, manualId));

	// set resource (wet40 folder) path based on if infozone flag was passed
	const localPath = relative(dirname(filePath), (await findWet4(inputDir))).replace(/\\/g, '/');
	const infozonePath = 'http://infozone';
	const wet4path = flags.infozone ? infozonePath : localPath;

	try {
		// return the filled template
		return fillTemplate(docData, wet4path);
	} catch (e) {
		console.error(`error in ${basename(filePath)}`);
		console.error(e);
	}
}

async function findWet4(inputDir, counter = 0) {
	const wet4Dir = `${inputDir}/wet40`;

	// If folder isn't found after going up 10 levels, returns default path.
	if (counter > 10) {
		console.log('wet40 folder not found, default path will be used');
		return wet4Dir;
	}

	// Recursively go up a directory until a "wet40" folder is found.
	return (await fs.exists(wet4Dir)) ? wet4Dir : findWet4(`${inputDir}/..`, counter + 1);
}

