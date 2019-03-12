import fs from 'fs-extra';
import klaw from 'klaw-sync';
import { extname } from 'path';

export default function fileIterator(rootDir = `${process.env.USERPROFILE}\\Desktop\\convert_to_wet4`) {
	const excludeDirs = /Draft|images|archive|old|pdf|wet40|docs|_notes/i;
	const filter = (item) => {
		if (excludeDirs.test(item.path)) {
			return false;
		}
		if (extname(item.path) === '.html') {
			return true;
		}
	};

	try {
		// Create iterator from the walkFiles (async) generator function
		return klaw(rootDir, { filter, fs, traverseAll: true, nodir: true }).map((item) => item.path);
	} catch (e) {
		console.error('An error occurred:');
		console.error(e);
	}
}