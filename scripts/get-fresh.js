const fs = require('fs-extra');
const path = require('path');
const constants = require('../src/constants');

const tomsPath = constants.tomsTestingDir;
const tomsOutputPath = constants.conversionInputDir;
const selectedToms = process.argv.slice(2).map((tomNum) => `TOM${tomNum}`);

async function getFresh() {
	const copyTasks = [];

	for (const tom of selectedToms) {
		try {
			const tomPath = path.resolve(tomsPath, tom);
			const outputPath = path.resolve(tomsOutputPath, tom);

			copyTasks.push(
				fs.copy(tomPath, outputPath).then(() => console.log(`Successfully got a fresh copy of ${tom}\nOutput to ${outputPath}`))
			);

		} catch (e) {
			console.error('Uh oh, an error occurred:');
			console.error(e);
		}
	}
	try {
		return await Promise.all(copyTasks);
	} catch (e) {
		console.error('Error in Promise.all()');
		console.error(e);
	}
}

getFresh().then(() => console.log('donezo'));