//import fs from 'fs-extra';
import cheerio from 'cheerio';
import { resolve, basename } from 'path';
import { readdirSync, readFile } from 'fs-extra';
import { convertData } from '../scripts/cache-tom-data';
import extractData from '../src/extract-data';

//import walkFiles from 'walk-asyncgen';

// shorthand functions
const makeCheerio = (fileContents) => cheerio.load(fileContents, { decodeEntities: false });
const absPath = (manual, name = '') => resolve(rootDir, manual, name);
const liFormatRegex = /\s+(<li[^>]*?>.+<(?!br|strong)[a-z]+[^>]*?>) *$/im;

//const baseDir = `Desktop\\convert_to_wet4\\TOM1915`;
//const rootDir = resolve(process.env.USERPROFILE, baseDir); // making multiple variables in case I change the path a lot
//const paths = readdirSync(rootDir).filter((filename) => /\.html/i.test(filename));

//test.each(paths)('%s', async (filename) => {
//	const filePath = resolve(rootDir, filename);
//	const fileContent = await readFile(filePath, 'utf-8');
//	const manualData = await convertData(extractData(fileContent), filePath);
//	const $ = makeCheerio(manualData.content);
//});

describe.each(Object.keys(manuals.wet4))('%s', (manualName) => {
	//const manualData = manuals.wet2[manualName];
	const wet4Data = manuals.wet4[manualName];

	describe.each(Object.keys(wet4Data))('%s', (fileKey) => {
		const fileData = wet4Data[fileKey];
		const $ = makeCheerio(fileData.content);

		test('Alert headers', async () => {
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

					//const badFormatRE =
					//	/^(?:Note|Remarque)(?:\s*|&nbsp;)(?:#?\d+(?:\s*|&nbsp;)(?!\d).+|(?!(?:\s*|&nbsp;)#?\d+)(?!\d).+)/i;
					//expect(badFormatRE.test(headerText), `Note header format is bad: ${headerText}`).toBeFalse();
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

//describe('Testing div tables', () => {
//	describe.each(Object.keys(manuals.wet2))('Manual %s', (manualName) => {
//		const manualData = manuals.wet2[manualName];
//
//		describe.each(Object.keys(manualData))('File %s', (fileKey) => {
//			const fileData = manualData[fileKey];
//
//			test('div tables', async () => {
//				const $ = makeCheerio(fileData.content);
//
//				const spansSelector = '.span-2, .span-3, .span-4, .span-5, .span-6';
//				const borderSpansSelector = '.border-span-1, .border-span-2, .border-span-3, .border-span-4, .border-span-5';
//				const wrappers = $(spansSelector)
//					.has(borderSpansSelector)
//					.filter((i, wrapper) => $(wrapper).children(borderSpansSelector).length > 0);
//
//				wrappers.each((i, wrapper) => {
//					const $w = $(wrapper);
//					const nonBorderSpanElems = $w.children(`:not(${borderSpansSelector}, .border-span-6, .clear)`);
//					expect(nonBorderSpanElems.length, 'Found non-border-spans in wrapper').toEqual(0);
//				});
//			});
//		});
//	});
//});

//describe('Testing conversion', () => {
//	describe.each(Object.keys(manuals.wet4))('Manual %s:', (manualName) => {
//		const manualPath = absPath(manualName);
//		const manualData = manuals.wet4[manualName];
//
//		describe.each(Object.keys(manualData))('%s:', (filePath) => {
//			try {
//				//const fileContent = manualData[filePath].content;
//				//const $ = makeCheerio(fileContent);
//
//				//test('fileContent is not empty', async () => {
//				//	expect(!!fileContent, 'fileContent is truthy').toBeTrue();
//				//});
//				//
//				//test('Notes don\'t have any errors', async () => {
//				//	const notesRef = $('.alert.alert-info');
//				//
//				//	if (notesRef.length > 0) {
//				//		const notePs = notesRef.find('p');
//				//		const noteHeaders = notePs.filter('.h3');
//				//		//const noteParagraphs = notePs.not('.h3');
//				//
//				//		noteHeaders.each((i, header) => {
//				//			const headerText = $(header).text();
//				//			expect(headerText.includes(':'), `Colon found in note header: ${headerText}`).toBe(false);
//				//			const badFormatRE =
//				//				/^(?:Note|Remarque)(?:\s*|&nbsp;)(?:#?\d+(?:\s*|&nbsp;)(?!\d).+|(?!(?:\s*|&nbsp;)#?\d+)(?!\d).+)/i;
//				//			expect(badFormatRE.test(headerText), `Note header format is bad: ${headerText}`).toBeFalse();
//				//		});
//				//
//				//		if (/^(?:Note|Remarque|Example|Exemple)/.test(notesRef.text())) {
//				//			const notesWithHeaders = notesRef.has('p.h3'); // filter out notes that don't have a header
//				//			expect(notesWithHeaders.length, `Note(s) with no headers in ${basename(filePath)}`)
//				//				.toEqual(notesRef.length);
//				//		}
//				//	}
//				//});
//
//				test('Breadcrumbs don\'t have any stray ">"s', async () => {
//					const { breadcrumbs } = manualData[filePath];
//
//					if (filePath.includes('application_process_4032.12-e')) {
//						console.log(breadcrumbs);
//					}
//					expect(/>|&#62;/.test(breadcrumbs), 'breadcrumbs have stray ">"s').toBeFalse();
//				});
//
//				// add test for note <p> starting with whitespace/&nbsp;
//				test('<p>s in notes don\'t start with whitespace/&nbsp;', async () => {
//
//				});
//
//			} catch (e) {
//				console.error('AN ERROR OCCURRED READING THE FILE PROBABLY');
//			}
//		});
//	});
//});
