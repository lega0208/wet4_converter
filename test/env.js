const resolve = require('path').resolve;
const NodeEnvironment = require('jest-environment-node');
const fs = require('fs-extra');

const specificDir = 'test';
const baseDir = `Desktop\\convert_to_wet4${specificDir ? '\\' + specificDir : ''}`;
const rootDir = resolve(process.env.USERPROFILE, baseDir); // making multiple variables in case I change the path a lot
const wet2CachePath = resolve('./cache/', 'wet2');
const wet4CachePath = resolve('./cache/', 'wet4');
const tomsToSkip = [
	'1910',
	'191030',
	'1911',
	'1915',
	'1920',
	'1921',
	'1924',
	'1928',
	'1940',
	'1950',
	'1960',
	'1970',
	'1980',
	'2000',
	'3020',
	'401010',
	'401011',
	'40108',
	'40109',
	'4031',
	'4032',
	'403215',
	'40328',
	'4033',
	'4041',
	'404640',
	'404650',
	'4082',
	'40921',
	'40922',
	'40923',
].map((name) => 'TOM' + name);

const initManuals = async () => {
	const manuals = { wet2: {}, wet4: {} };
	const manualsDir = process.env.TEST_ALL ? wet2CachePath : rootDir;
	const manualNames = (await fs.readdir(manualsDir))
		.map((tomName) => tomName.replace('.json', ''))
		.filter((name) => /TOM/.test(name) && !tomsToSkip.includes(name));

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
		if (process.env['NO_CACHE'] !== 'true' || !process.argv.includes('no-cache')) {
			this.global.manuals = await initManuals();
			this.global.rootDir = rootDir;
		}
	}

	async teardown() {
		await super.teardown();
	}

	runScript(script) {
		return super.runScript(script);
	}
}

module.exports = CustomEnvironment;