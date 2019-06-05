import fs from 'fs-extra';
import walkFiles from 'walk-asyncgen';
import commander from 'commander-fixed';
import { resolve, basename } from 'path';
import convertFile from './convert-file';


// Set default input and output directories to use if no cli arguments are passed
const defaultDir = process.env.USERPROFILE + '\\desktop\\convert_to_wet4\\';
const defaultOutputDir = process.env.USERPROFILE + '\\desktop\\converted_to_wet4\\';

// Set up cli and start main with callback
commander
	.usage('[inputDir] [options]')
	.arguments('[inputDir]')
	.option('-o, --outputDir <outputDir>', 'Set the output directory')
	.option('-i, --infozone', 'Use the infozone CDN resource url rather than a relative path to local resources')
	.option('-d, --dry', 'Do a dry run to test things (no output)')
	.option('-e, --exclude <excludeDirs>', 'Specify dirnames to exclude')
	.option('-g, --gdrive', 'Output to G: drive with imgs, PDFs, etc.')
	.action(async (inputDir, commanderRef) => {
		const flags = {
			infozone: commanderRef.infozone || false,
			dry: commanderRef.dry || false,
			exclude: commanderRef.exclude,
			gdrive: commanderRef.gdrive || false,
		};
		// console.log(`inputDir: ${inputDir}\noutputDir: ${commanderRef.outputDir}`);
		// console.log(`flags: ${JSON.stringify(flags, null, 2)}`);
		const gdrivePath =
			'\\\\omega\\natdfs\\cra\\hq\\absb\\absb_h0e\\gv1\\ird2\\ctsd\\dss\\tom_online\\wet4_conversion\\To be verified\\';

		await main(inputDir, commanderRef.outputDir || commanderRef.gdrive ? gdrivePath : undefined, flags);
	})
	.parse(process.argv);

async function main(inputDir, outputDir, flags) {
	outputDir = inputDir ? resolve(defaultOutputDir, `TOM${inputDir}`) : defaultOutputDir;
	inputDir = inputDir ? resolve(defaultDir, `TOM${inputDir}`) : defaultDir;

	// Options for the file iterator to use to include/exclude files/folders/extensions that match the regex
	const opts = {
		excludeDirs:
			new RegExp(`Draft|donezo|test|Verified|images|wet40|old|moved in 4092${
				flags.exclude ? '|TOM' + flags.exclude.replace(/ /g, '|TOM') : ''
			}`, 'i'),
		includeExt: /\.html/
	};

	const start = Date.now(); // Start time
	let fileCount = 0; // For counting number of files processed

	try {
		// Create iterator from the walkFiles (async) generator function
		const pathIterator = walkFiles(inputDir, opts);

		// Use "for await" because iterator is async
		for await (const filePath of pathIterator) {
			// todo: Check if html file before converting, also copy images and/or other files
			const file = await convertFile(filePath, inputDir, flags);

			// Verify that file isn't an empty string or other falsy value
			if (!file) {
				console.error('No data for ' + filePath);
			} else {
				if (!flags.dry) await fs.outputFile(filePath.replace(inputDir, outputDir), file, 'utf-8');
				fileCount++;
			}
		}
		if (!flags.dry) await copyResources(inputDir, outputDir);
	} catch (e) {
		console.error(e);
		console.error(`Input path: ${inputDir}`);
		console.error(`Output path: ${outputDir}`);
	}

	// End time
	const end = Date.now();
	const elapsedTime = Math.floor(end - start) / 1000;

	console.log('\nConversion finished');
	console.log(`${fileCount} files were output to ${resolve(outputDir)} in ${elapsedTime} seconds`)
}

async function copyResources(inputDir, outputDir) {
	try {
		const manualNames = (await fs.readdir(inputDir)).filter((name) => name.includes('TOM'));
		const manualPaths = basename(inputDir).startsWith('TOM')
			? [ inputDir ]
			: manualNames.map((manualName) => resolve(inputDir, manualName));

		// Options for the file iterator to use to include/exclude files/folders/extensions that match the regex
		const opts = {
			includeDirs: new RegExp(`images?|pdf|docs|js`, 'i'),
			includeExt: /\.(?!html)/
		};

		for (const manual of manualPaths) {
			const iter = walkFiles(manual, opts);

			for await (const filePath of iter) {
				//console.log(`Copying ${basename(filePath)}`);
				fs.copy(filePath, filePath.replace(inputDir, outputDir));
			}
		}
	} catch (e) {
		console.error('Error copying resources:');
		console.error(e);
	}
}