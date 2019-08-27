const fs = require('fs-extra');
const { resolve } = require('path');
const constants = require('../src/constants');

const selectedToms = process.argv.slice(2).map((tomNum) => `TOM${ tomNum }`);

(async function() {
	const {
		conversionOutputDir,
		tomsTestingDir,
		tomsSecureDir,
		toBeVerifiedDir
	} = constants;

	for (const tom of selectedToms) {
		try {
			const srcPath = resolve(conversionOutputDir, tom);
			const outputPaths = [
				resolve(toBeVerifiedDir, tom),
				resolve(tomsTestingDir, tom),
				resolve(tomsSecureDir, tom),
			];

			for (const outputPath of outputPaths) {
				await fs.copy(srcPath, outputPath);
				console.log(`Copied:\n${srcPath}\nto:\n${outputPath}`);
			}
		} catch (e) {
			console.error('Uh oh, an error occurred:');
			console.error(e);
		}
	}

	console.log('done!');

	return Promise.resolve();
})();