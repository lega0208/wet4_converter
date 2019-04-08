const resolve = require('path').resolve;
const NodeEnvironment = require('jest-environment-node');
const fs = require('fs-extra');

const specificDir = 'test';
const baseDir = `Desktop\\convert_to_wet4${specificDir ? '\\' + specificDir : ''}`;
const rootDir = resolve(process.env.USERPROFILE, baseDir); // making multiple variables in case I change the path a lot
const wet2CachePath = resolve('./cache/', 'wet2');
const wet4CachePath = resolve('./cache/', 'wet4');

const initManuals = async () => {
	const manuals = { wet2: {}, wet4: {} };
	const manualsDir = process.env.TEST_ALL ? wet2CachePath : rootDir;
	const manualNames = (await fs.readdir(manualsDir))
		.filter((name) => /TOM/.test(name))
		.map((tomName) => tomName.replace('.json', ''));

	for (const manualName of manualNames) {
		//const wet2Data = await fs.readJSON(resolve(wet2CachePath, `${manualName}.json`));
		const wet4Data = await fs.readJSON(resolve(wet4CachePath, `${manualName}.json`));

		//manuals.wet2[manualName] = wet2Data;
		manuals.wet4[manualName] = wet4Data;
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