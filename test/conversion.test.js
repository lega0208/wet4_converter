import fs from 'fs-extra';
import cheerio from 'cheerio';
import { resolve, basename } from 'path';
import fileIterator from './file-iter';
import convertFile from '../src/convert-file';
import walkFiles from 'walk-asyncgen';

describe('Testing conversion', () => {
	// shorthand functions
	const makeCheerio = (fileContents) => cheerio.load(fileContents, { decodeEntities: false });
	const absPath = (manual, name = '') => resolve(rootDir, manual, name);

	describe.each(Object.keys(manuals))('Manual %s:', (manualName) => {
		const manualPath = absPath(manualName);
		const filePaths = manuals[manualName];

		describe.each(filePaths)('%s:', (filePath) => {
			//const fileContent = fs.readFileSync(filePath, 'utf8');
			const fileContent = convertFile(filePath, manualPath);
			try {
				test('Notes don\'t have any errors', async () => {
					const $ = makeCheerio(await fileContent);
					const notesRef = $('.alert.alert-info');

					if (notesRef.length > 0) {
						notesRef.each((i, note) => {
							const noteRef = $(note);
							const headersRef = noteRef.find('h3,h4,h5,.h3,.h4,.h5');

							headersRef.each((i, noteHeader) => {
								const headerText = $(noteHeader).text();
								expect(headerText.includes(':'), `Colon found in note header: ${headerText}`).toBe(false);

								const badFormatRE =
									/^(?:Note|Remarque)(?:\s*|&nbsp;)(?:#?\d+(?:\s*|&nbsp;)(?!\d).+|(?!(?:\s*|&nbsp;)#?\d+)(?!\d).+)/i;
								expect(badFormatRE.test(headerText), `Note header format is bad: ${headerText}`).toBeFalse();

							});

							noteRef.children('p').each((i, p) => {
								const pRef = $(p);
								const colonRE = /^\s*:/;
								expect(colonRE.test(pRef.text()), `Colon found at start of note: "${pRef.text()}"`).toBeFalse();
							});

							if (/^(?:Note|Remarque|Example|Exemple)/.test(notesRef.text())) {
								const noteHeaders = noteRef.find('p.h3, p.h4, h3, h4');
								expect(noteHeaders.length, `Note has no headers in ${basename(filePath)}`).toBeGreaterThan(0);
							}
						});
					}
				});
			} catch (e) {
				console.error('AN ERROR OCCURRED READING THE FILE PROBABLY');
			}
		});
	});
});


