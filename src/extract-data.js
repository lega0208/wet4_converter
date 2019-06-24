import cheerio from 'cheerio';
import { replaceSpecChars } from './util';

const extractMetadata = ($, filepath) => {
	const metaRefs = $('meta');
	const metadata = {};

	const setIfUndefined = (propName, val) => !metadata[propName] ? (metadata[propName] = val) : null;

	metaRefs.each((i, meta) => {
		switch (meta.attribs.name) {
			case 'dcterms.title':
				metadata.title = meta.attribs.content || '';
				break;
			case 'ManualHomePage':
				metadata.isHomepage = meta.attribs.content.includes('true') || meta.attribs.content.includes('True')
					? 'True' : false; // does dis work?
				break;
			case 'ManualID':
				metadata.manualId = meta.attribs.content || '';
				break;
			case 'ManualName':
				metadata.manualName = meta.attribs.content || '';
				break;
			case 'description':
				setIfUndefined('description', (meta.attribs.content || ''));
				break;
			case 'dc.description':
				setIfUndefined('description', (meta.attribs.content || ''));
				break;
			case 'keywords':
				metadata.keywords = meta.attribs.content || '';
				break;
			case 'dc.creator':
				metadata.creator = meta.attribs.content || '';
				break;
			case 'owner':
				metadata.owner = meta.attribs.content || '';
				break;
			case 'dc.publisher':
				metadata.publisher = meta.attribs.content || '';
				break;
			case 'dcterms.issued':
				metadata.issued = meta.attribs.content || '';
				break;
			case 'dcterms.modified':
				metadata.modified = meta.attribs.content || '';
				break;
		}
	});

	if (/-e\.html/.test(filepath)) {
		metadata.language = 'eng';
	} else if (/-f\s*\.html/.test(filepath)) {
		metadata.language = 'fra';
	}

	return metadata;
};

const extractNavItems = ($) => {
	const navItems = {};
	const navRef = $('.embedded-nav').first();
	const navItemRefs = $(navRef).find('a');

	if (navItemRefs.length < 1) {
		return navItems;
	}

	navItemRefs.each((i, navItem) => {
		const navItemRef = $(navItem);
		const itemText = navItemRef.html();
		const itemLink = navItemRef.attr('href');

		const prevPageRegex = /previous|pr&eacute;c&eacute;dente|précédente/i;
		const homePageRegex = /return|retourner/i;
		const nextPageRegex = /next|suivante/i;

		switch (true) {
			case prevPageRegex.test(itemText):
				navItems['prevPage'] = itemLink;
				break;
			case homePageRegex.test(itemText):
				navItems['homePage'] = itemLink;
				break;
			case nextPageRegex.test(itemText):
				navItems['nextPage'] = itemLink;
				break;
		}
	});

	return navItems;
};

export default function extractData(fileContents, filePath) {
	const $ = cheerio.load(fileContents, { decodeEntities: false });

	const extract = (regex) => {
		const result = regex.exec(fileContents) || [];
		return (result.length < 2) ? '' : result[1];
	};

	const title = $('title').first().text();

	const metadata = extractMetadata($, filePath);

	const langFilename = $('#cn-cmb1 > a').first().attr('href') || '';

	const $bc = $('#cn-bcrumb > ol');

	$bc.children('li').each(
		(i, li) => {
			const $li = $(li);
			const sanitizedHtml = $li.html().replace(/\r?\n/g, '');
			$li.html(sanitizedHtml);
		}
	);

	const breadcrumbs =
		($bc.html() || '')
			.trim()
			.replace(/ ?&#62;/g, '')
			.split('\r\n')
			.slice(1)
			.map((li) => `\t\t\t\t\t${li.trim()}`)
			.join('\r\n');

	const tomTitle = breadcrumbs.trim().split(`\r\n`)[0];

	const tomNumber = /(?:TOM|MOI)(?:\s*|&nbsp;)((?!&)[\d().&amp;]+)/.exec(
		tomTitle.replace(/<li><a[^>]+?>(.+?)<\/a><\/li>/, '$1')
						.replace(/<abbr[^>]+?>(.+?)<\/abbr>/g, '$1')
	)[1];

	const pageTitle = ($('h1').first().html() || '').replace(/<!--.+?-->/g, '').trim();

	const $toc = $('div.module-table-contents').first();
	$toc.find('p')
		.filter((p) => !/table(?: des mat| of contents)/i.test($(p).text()))
		.remove();

	const toc = ($toc.html() || '').trim();

	const secMenu = ($('div.module-menu-section ul')
		.first()
		.html() || '')
		.trim();

	const nav = extractNavItems($);

	const content =
		extract(/<!--\sSearchable\scontent\sbegins\s\/\sdebut\sde\sla\srecherche\sdu\scont.+?-->\s+?([\s\S]+)<!--\sSearchable\scontent\sends\s\/\sfin\sde\sla\srecherche\sdu\scontenu\s-->/i);

	const attachment = {
		text: '',
		uri: '',
	};

	const attachmentAElems = $('a').filter((i, a) => /\.(?:pdf|docx?|xlsx)/i.test(a.attribs.href));
	const contentAttachments = $('a', content).filter((i, a) => /\.(?:pdf|docx?|xlsx)/i.test(a.attribs.href));

	if (attachmentAElems.length === 1 && contentAttachments.length === 0) {
		const attachmentParent = attachmentAElems.parent();
		attachment.uri = attachmentAElems.attr('href');
		attachment.text = attachmentParent.html().replace(/(.*?)<a[^>]+?>(.+?)<\/a>(.*?)/, '$1$2$3');
	}

	const hasQuicksearch = ($('#rejectsearch-form, #ecsearch-form, #fieldcodesearch-form').length > 0);

	return {
		title: replaceSpecChars(title),
		metadata,
		langFilename,
		breadcrumbs: replaceSpecChars(breadcrumbs),
		tomTitle: replaceSpecChars(tomTitle),
		tomNumber,
		pageTitle: replaceSpecChars(pageTitle),
		toc: replaceSpecChars(toc),
		secMenu: replaceSpecChars(secMenu),
		nav,
		content,
		attachment,
		hasQuicksearch,
	};
}
