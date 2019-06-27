const fs = require('fs-extra');
const path = require('path');

const convertPath = path.resolve(`${process.env.USERPROFILE}`, 'Desktop', 'convert_to_wet4');
const tomFolders = fs.readdirSync(convertPath)
	.filter((name) => /^TOM/.test(name))
	.map((name) => path.resolve(convertPath, name));

for (const dir of tomFolders) {
	fs.removeSync(dir);
	console.log(`Deleted ${path.basename(dir)}`);
}