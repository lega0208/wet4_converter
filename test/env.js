const resolve = require('path').resolve;
const NodeEnvironment = require('jest-environment-node');

const specificDir = '';
const baseDir = `Desktop\\convert_to_wet4${specificDir ? '\\' + specificDir : ''}`;
const rootDir = resolve(process.env.USERPROFILE, baseDir);

class CustomEnvironment extends NodeEnvironment {
	constructor(config) {
		super(config);
	}

	async setup() {
		await super.setup();
	}

	async teardown() {
		await super.teardown();
	}

	runScript(script) {
		return super.runScript(script);
	}
}

module.exports = CustomEnvironment;