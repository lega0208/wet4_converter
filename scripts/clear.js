const fs = require('fs-extra');
const path = require('path');
const constants = require('../src/constants');

module.exports = function() {
	const convertPath = constants.conversionInputDir;
	const tomFolders = fs.readdirSync(convertPath)
		.filter((name) => /^TOM/.test(name))
		.map((name) => path.resolve(convertPath, name));

	for (const dir of tomFolders) {
		fs.removeSync(dir);
		console.log(`Deleted ${path.basename(dir)}`);
	}
};