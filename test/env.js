const resolve = require('path').resolve;
const NodeEnvironment = require('jest-environment-node');
const fs = require('fs-extra');
const walkFiles = require('walk-asyncgen');

const specificDir = 'test';
const baseDir = `Desktop\\convert_to_wet4${specificDir ? '\\' + specificDir : ''}`;
const rootDir = resolve(process.env.USERPROFILE, baseDir); // making multiple variables in case I change the path a lot

const initManuals = async () => {
	const manuals = {};
	// make object for manual names & data
	const manualNames = (await fs.readdir(rootDir)).filter((name) => name.includes('TOM'));

	const opts = {
		excludeDirs: new RegExp(`Draft|donezo|Verified|images|pdf|wet40`, 'i'),
		includeExt: /\.html/
	};

	for (const manualName of manualNames) {
		const manualPath = resolve(rootDir, manualName);
		const iter = walkFiles(manualPath, opts);
		const filePaths = [];

		for await (const file of iter) {
			filePaths.push(file);
		}

		manuals[manualName] = await Promise.all(filePaths);
	}
	return manuals;
};

class CustomEnvironment extends NodeEnvironment {
	constructor(config) {
		super(config);
	}

	async setup() {
		await super.setup();
		this.global.manuals = await initManuals();
		this.global.rootDir = rootDir;
	}

	async teardown() {
		await super.teardown();
	}

	runScript(script) {
		return super.runScript(script);
	}
}

module.exports = CustomEnvironment;