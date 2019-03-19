//import fs from 'fs-extra';
import cheerio from 'cheerio';
import { resolve, basename } from 'path';
//import convertFile from '../src/convert-file';
//import walkFiles from 'walk-asyncgen';

describe('Testing conversion', () => {
	// shorthand functions
	const makeCheerio = (fileContents) => cheerio.load(fileContents, { decodeEntities: false });
	const absPath = (manual, name = '') => resolve(rootDir, manual, name);

	describe.each(Object.keys(manuals.wet4))('Manual %s:', (manualName) => {
		const manualPath = absPath(manualName);
		const manualData = manuals.wet4[manualName];

		describe.each(Object.keys(manualData))('%s:', (filePath) => {
			try {
				const fileContent = manualData[filePath].content;
				const $ = makeCheerio(fileContent);

				test('fileContent is not empty', async () => {
					expect(!!fileContent, 'fileContent is truthy').toBeTrue();
				});

				test('Notes don\'t have any errors', async () => {
					const notesRef = $('.alert.alert-info');

					if (notesRef.length > 0) {
						const notePs = notesRef.find('p');
						const noteHeaders = notePs.filter('.h3');
						//const noteParagraphs = notePs.not('.h3');

						noteHeaders.each((i, header) => {
							const headerText = $(header).text();
							expect(headerText.includes(':'), `Colon found in note header: ${headerText}`).toBe(false);
							const badFormatRE =
								/^(?:Note|Remarque)(?:\s*|&nbsp;)(?:#?\d+(?:\s*|&nbsp;)(?!\d).+|(?!(?:\s*|&nbsp;)#?\d+)(?!\d).+)/i;
							expect(badFormatRE.test(headerText), `Note header format is bad: ${headerText}`).toBeFalse();
						});

						if (/^(?:Note|Remarque|Example|Exemple)/.test(notesRef.text())) {
							const notesWithHeaders = notesRef.has('p.h3'); // filter out notes that don't have a header
							expect(notesWithHeaders.length, `Note(s) with no headers in ${basename(filePath)}`)
								.toEqual(notesRef.length);
						}
					}
				});

				test('Breadcrumbs don\'t have any stray ">"s', async () => {
					expect($('ol.breadcrumb').first().text().includes('&#62;'), 'breadcrumbs have stray ">"s').toBeFalse();
				});

				// add test for note <p> starting with whitespace/&nbsp;

			} catch (e) {
				console.error('AN ERROR OCCURRED READING THE FILE PROBABLY');
			}
		});
	});
});


