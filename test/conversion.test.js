import cheerio from 'cheerio';
import { resolve, basename } from 'path';
//import { readdirSync, readJSONSync } from 'fs-extra';
import { readdirSync, readFileSync } from 'fs';

import { convertData as convert } from './util';

// shorthand functions
const makeCheerio = (fileContents) => cheerio.load(fileContents, { decodeEntities: false });
const absPath = (manual, name = '') => resolve(rootDir, manual, name);
const liFormatRegex = /\s+(<li[^>]*?>.+<(?!br|strong)[a-z]+[^>]*?>) *$/im;
const getCachedData = (tomName) => JSON.parse(readFileSync(resolve('./cache/', `${tomName}.json`), 'utf8'));

const specificDir = '';
const baseDir = `Desktop\\convert_to_wet4${specificDir ? '\\' + specificDir : ''}`;
const rootDir = resolve(process.env.USERPROFILE, baseDir); // making multiple variables in case I change the path a lot
const cachePath = resolve('./cache');

const tomsToSkip = [
	'SKIPPED_TOM_NUMBER'
].map((name) => 'TOM' + name);

const getManualsList =
	() => (readdirSync(process.env.TEST_ALL ? cachePath : rootDir))
		.map((tomName) => tomName.replace('.json', ''))
		.filter((name) => /TOM/.test(name) && !tomsToSkip.includes(name));

const manualsList = getManualsList();
describe.each(manualsList)('%s', (manualName) => {
	const manualData = getCachedData(manualName);

	describe.each(Object.keys(manualData))('%s', (filePath) => {
		test('Alert headers', async () => {
			const fileData = manualData[filePath];
			const convertedData = convert(fileData, filePath);
			const $ = makeCheerio(convertedData.content);
			const $alerts = $('.alert');

			$alerts.each((i, alert) => {
				const $alert = $(alert);
				const notePs = $alert.find('p');
				const noteHeaders = notePs.filter('.h3');

				expect(noteHeaders.length, `No header:\n${$alert.html()}`).toBeGreaterThan(0);

				noteHeaders.each((i, header) => {
					const headerText = $(header).text();
					if (/Note|Remarque|^Ex[ae]mple|Important|Exception|Exemple de texte|Sample text|Verify|Vérifier/i) {
						expect(!headerText.includes(':'));
					} else if (/(?:For(?: |&nbsp;))?Example|(?:Par(?: |&nbsp;))?Exemple/) {
						expect(headerText.includes(':'));
					}
				});

				const noteParas = notePs.not('.h3');
				noteParas.each((i, p) => {
					const $p = $(p);

					expect($p.text()).not.toMatch(/^\s/);
					expect($p.text()).not.toMatch(/^&nbsp;/);
					expect($p.text()).not.toMatch(/^:/);
					expect($p.text()).not.toMatch(/^<\/strong>/);
				})
			});
			const noHeaderAlerts = $alerts.filter((i, alert) => $(alert).find('p.h3').length === 0);

			noHeaderAlerts.each((i, alert) => {
				const $alert = $(alert);
				const strongs = $alert.find('strong');
				if (strongs.length > 0) {
					const headerText = strongs.first().text().trim();
					const headerLength = headerText.length;
					const alertStartText = $alert.text().trim().slice(0, headerLength);
					expect(headerText).not.toMatch(alertStartText);
				}
			})
		});

		//test('Undefined file data', async () => {
		//	for (const key of Object.keys(fileData)) {
		//		if (key === 'metadata') {
		//			console.log(fileData.metadata);
		//			for (const [key, val] of Object.entries(fileData.metadata)) {
		//				expect(val, `metadata.${key} is undefined`).not.toBeUndefined();
		//			}
		//		} else {
		//			expect(fileData[key], `${key} is undefined`).not.toBeUndefined();
		//		}
		//	}
		//})
	});
});