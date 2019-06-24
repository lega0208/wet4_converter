const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const tomsPath = `\\\\omega\\natdfs\\Services\\Central_storage\\Testing_ABSB_Secure\\IND\\`;
const tomsOutputPath = path.resolve(`${ process.env.USERPROFILE }`, 'Desktop', 'convert_to_wet4');
const selectedToms = process.argv.slice(2).map((tomNum) => `TOM${ tomNum }`);

(async function() {
	const copyTasks = [];

	for (const tom of selectedToms) {
		try {
			const tomPath = path.resolve(tomsPath, tom);
			const outputPath = path.resolve(tomsOutputPath, tom);

			copyTasks.push(
				fs.copy(tomPath, outputPath)
					.then(() => console.log(`Successfully got a fresh copy of ${ tom }\nOutput to ${ outputPath }`))
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
})().then(() => exec('npm start', (error, stdout, stderr) => {
	if (error) {
		console.error(`exec error: ${error}`);
		return;
	}
	if (stderr) {
		console.error(`stderr: ${stderr}`);
	}
	console.log(stdout);
}));