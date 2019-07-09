const fs = require('fs-extra');
const path = require('path');
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
			const srcPath = path.resolve(conversionOutputDir, tom);
			const outputPaths = [
				path.resolve(toBeVerifiedDir, tom),
				path.resolve(tomsTestingDir, tom),
				path.resolve(tomsSecureDir, tom),
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