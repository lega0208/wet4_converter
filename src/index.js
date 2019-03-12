import { resolve } from 'path';
import fs from 'fs-extra';
import walkFiles from 'walk-asyncgen';
import commander from 'commander-fixed';
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
	.action(async (inputDir, commanderRef) => {
		const flags = {
			infozone: commanderRef.infozone || false,
			dry: commanderRef.dry || false,
			exclude: commanderRef.exclude,
		};
		// console.log(`inputDir: ${inputDir}\noutputDir: ${commanderRef.outputDir}`);
		// console.log(`flags: ${JSON.stringify(flags, null, 2)}`);

		await main(inputDir, commanderRef.outputDir, flags);

	})
	.parse(process.argv);

async function main(inputDir = defaultDir, outputDir = defaultOutputDir, flags) {

	// Options for the file iterator to use to include/exclude files/folders/extensions that match the regex
	const opts = {
		excludeDirs: new RegExp(`Draft|donezo|Verified|images|wet40${flags.exclude ? '|TOM' + flags.exclude.replace(/ /g, '|TOM') : ''}`, 'i'),
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
	} catch (e) {
		console.error(e);
	}

	// End time
	const end = Date.now();
	const elapsedTime = Math.floor(end - start) / 1000;

	console.log('\nConversion finished');
	console.log(`${fileCount} files were output to ${resolve(outputDir)} in ${elapsedTime} seconds`)
}
