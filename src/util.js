const beautifyHTML = require('js-beautify').html;

export const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);
export const indent =
	(text, num = 1) => text
		.split('\r\n')
		.map((line) => Array(num).fill('\t').join('') + line)
		.join('\r\n');

const inlineElems = [
	'a', 'abbr', 'area', 'audio', 'b', 'br', 'button', 'canvas', 'cite',
	'code', 'data', 'datalist', 'del', 'em', 'embed', 'i', 'iframe',
	'input', 'ins', 'kbd', 'label', 'mark', 'math', 'meter', 'noscript',
	'progress', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg',
	'template', 'textarea', 'time', 'u', 'video', 'wbr', 'text',
];

export function moveNestedElemsToNewline(html) {
	const re =
		new RegExp(`(\\s*<li[^>]*?>.+?)(<(?!(?:${inlineElems.join('|')})(?: [^>]+)?>)[a-z]+?(?: [^>]+)?>)[ \t]*`, 'm');

	//html = html.split('\r\n').filter((line) => !!line.trim()).join('\r\n');

	while (re.test(html)) {
		html = html.replace(re, '$1\r\n$2');
	}

	return html;
}

function removeEmptyLinesIfNotInPre(html) {
	let inPre;
	const openPreRE = /<pre[ >]/;
	const closePreRE = /<\/pre>/;
	const lines = html.split('\r\n');

	for (const [i, line] of lines.entries()) {
		if (openPreRE.test(line)) {
			inPre = true;
		} else if (closePreRE.test(line)) {
			inPre = false;
		}

		if (!inPre && !line.trim()) {
			lines[i] = '{removed}';
		}
	}

	return lines
		.filter((line) => !/^{removed}$/.test(line))
		.join('\r\n');
}

export function beautify(html) {
	const config = {
		indent_size: 2,
		indent_char: '  ',
		indent_with_tabs: true,
		eol: '\r\n',
		unescape_strings: true,
		wrap_line_length: 0,
		extra_liners: 'h1,h2,h3,h4,h5',
		preserve_newlines: true,
		inline: inlineElems,
	};

	//if (/The <strong>Search Work Items<\/strong> main screen allows you to select from two tabs\./.test(html)) {
	//	console.log(html);
	//}

	return beautifyHTML(html, config);
}

export function replaceSpecChars(html) {
	const specChars = [
		['–', '&ndash;'],
		['\\s&\\s', ' &amp; '],
		['Á', '&Aacute;'],
		['À', '&Agrave;'],
		['Â', '&Acirc;'],
		['Ä', '&Auml;'],
		['Ã', '&Atilde;'],
		['Å', '&Aring;'],
		['Ç', '&Ccedil;'],
		['É', '&Eacute;'],
		['È', '&Egrave;'],
		['Ê', '&Ecirc;'],
		['Ë', '&Euml;'],
		['Î', '&Icirc;'],
		['Ó', '&Oacute;'],
		['Ò', '&Ograve;'],
		['Ô', '&Ocirc;'],
		['Ö', '&Ouml;'],
		['Õ', '&Otilde;'],
		['÷', '&divide;'],
		['×', '&times;'],
		['…', '&hellip;'],
		['Œ', '&OElig;'],
		['œ', '&oelig;'],
		['’', '\''],
		['“|”', '"'],
		['\\s»', '&nbsp;»'],
		['«\\s', '«&nbsp;'],
		['(\\d)\s\\$', '$1&nbsp;$'],
		['(\\d)\s(\\d)', '$1&nbsp;$2'],
	];

	for (const findReplace of specChars) {
		const regex = new RegExp(findReplace[0], 'g');
		html = html.replace(regex, findReplace[1]);
	}

	return html;
}

export function formatContent(html) {
	const lines = html.split('\r\n');
	const getPrevLine = (i) => lines[i - 1] || null;
	const getPrevPrevLine = (i) => lines[i - 2] || null;
	const getNextLine = (i) => lines[i + 1] || null;
	const isHeader = (line = '') => /^\s*<h\d>/.test(line);
	const isBlankLine = (line = '') => /^\s*$/.test(line);
	const removePrevLine = (i) => lines[i - 1] = '{removed}';

	for (const [ i, line ] of lines.entries()) {
		const prevLine = getPrevLine(i);
		const prevPrevLine = getPrevPrevLine(i);
		const nextLine = getNextLine(i);

		// remove lines if multiple headers
		if (isHeader(line)
			&& prevLine !== null
			&& prevPrevLine !== null
			&& isBlankLine(getPrevLine(i))
			&& isHeader(getPrevPrevLine(i))
		) {
			removePrevLine(i);
		}

		// add line before p>strong
		if (/^<p[^>]*?><strong>.+<\/strong><\/p>/.test(line) && prevLine !== null && !isBlankLine(prevLine)) {
			lines[i] = '\r\n' + line;
		}

		// line after top-level list
		if (/^<\/[uo]l>$/.test(line) && getNextLine(i) !== null) {
			lines[i] += '\r\n';
		}

		const clearfixRE = /^<div class="clearfix/;
		// line after img (if not clearfix)
		if (/^<img/.test(line) && nextLine !== null && !clearfixRE.test(nextLine)) {
			lines[i] += '\r\n';
		}

		// line after clearfix
		if (clearfixRE.test(line) && nextLine !== null) {
			lines[i] += '\r\n';
		}
	}

	return lines.filter((line) => !/^{removed}$/.test(line)).join('\r\n');
}

export const formatHtml = (text, indents = 0) => {
	const formattedhtml = pipe(
		replaceSpecChars,
		removeEmptyLinesIfNotInPre,
		moveNestedElemsToNewline,
		beautify,
		formatContent,
	)(text);

	return !indents ? formattedhtml : indent(formattedhtml, indents);
};