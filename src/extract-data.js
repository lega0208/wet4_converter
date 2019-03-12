import cheerio from 'cheerio';

const extractMetadata = ($) => {
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
			case 'dc.language':
				setIfUndefined('language', (meta.attribs.content || ''));
				break;
			case 'dcterms.language':
				setIfUndefined('language', (meta.attribs.content || ''));
				break;
			case 'dcterms.issued':
				metadata.issued = meta.attribs.content || '';
				break;
			case 'dcterms.modified':
				metadata.modified = meta.attribs.content || '';
				break;
		}
	});
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
	//const title = extract(/<title>(.+)<\/title>/);

	const metadata = extractMetadata($);
	//const metadata = {
	//	title: extract(/<meta\sname="dcterms\.title"\scontent="(.+)"\s*\/>/),
	//	isHomepage: extract(/<meta\sname="ManualHomePage"\scontent="(.+)"\s*\/>/),
	//	manualId: extract(/<meta\sname="ManualID"\scontent="(.+)"\s*\/>/),
	//	description: extract(/<meta\sname="(?:dc\.)description"\scontent="(.+)"\s*\/>/),
	//	keywords: extract(/<meta\sname="keywords"\scontent="(.+)"\s*\/>/),
	//	creator: extract(/<meta\sname="dc\.creator"\scontent="(.+)"\s*\/>/),
	//	owner: extract(/<meta\sname="owner"\scontent="(.+)"\s*\/>/),
	//	publisher: extract(/<meta\sname="dc\.publisher"\scontent="([\s\S]+?)"\s*?\/>/),
	//	language:
	//		extract(/<meta\sname="dc(?:\.language|terms\.language)"\s(?:title|scheme)="ISO639-2(?:\/T)?"\scontent="(.+)"\s*\/>/),
	//	issued: extract(/<meta\sname="dcterms\.issued"\stitle="W3CDTF"\scontent="(.+)"\s*\/>/),
	//	modified: extract(/<meta\sname="dcterms\.modified"\stitle="W3CDTF"\scontent="(.+)"\s*\/>/),
	//};
	//
	//if (metadata.isHomepage === 'true' || metadata.isHomepage === 'True') {
	//	metadata.manualName = metadata.title;
	//} else {
	//	metadata.manualName = extract(/<meta\sname="ManualName"\scontent="(.+)"\s*\/>/);
	//}

	const langFilename = $('#cn-cmb1 > a').first().attr('href') || '';
		//extract(/<!--\sInstanceBeginEditable\sname=".*Link.*"\s-->\s*<a\shref\s?=\s?"(.+\.html)"\slang\s?=\s?".+">.+<\/a>/i);

	const breadcrumbs = ($('#cn-bcrumb > ol')
		.html() || '')
		.trim()
		.replace(/ &#62;/g, '')
		.split('\r\n')
		.slice(1)
		.map((li) => `\t\t\t\t\t${li.trim()}`)
		.join('\r\n');
		//extract(/<!--\sInstanceBeginEditable\sname=".*?Bread\s?crumb.*?"\s-->[\s\S]+?(?:Secure\sManuals|DGCPS|DGSCP)[\s\S]+?<\/li>\s*?(<li.*?><a[\s\S]+?<\/li>)\s*<\/ol>[\s\S]+?<!-- Bread\s?crumb ends/i)
		//	.replace(' &#62;', '');

	const tomTitle = breadcrumbs.trim().split(`\r\n`)[0];
		//extract(/<!--\sInstanceBeginEditable\sname=".*Bread\s?crumb.*?"\s-->[\s\S]+?(?:Secure\sManuals|DGCPS|DGSCP).*?<\/a>\s*&#62;\s*<\/li>[\s\S]*?<li.*?><a\shref\s?=\s?".+?">([\s\S]+?)<\/a>/i);

	const tomNumber = /(?:TOM|MOI)(?:\s*|&nbsp;)([\d().]+)/.exec(
		tomTitle.replace(/<li><a[^>]+?>(.+?)<\/a><\/li>/, '$1')
						.replace(/<abbr[^>]+?>(.+?)<\/abbr>/g, '$1')
	)[1];

	const pageTitle = ($('h1').first().html() || '').replace(/<!--.+?-->/g, '').trim();
		//extract(/<!--\sInstanceBeginEditable\sname=".*content\stitle.*"\s-->\s*?(.+)\s*?<!--\sInstanceEndEditable\s-->[\s\S]+?<\/h1>/i);

	const toc = ($('div.module-table-contents > ul')
		.first()
		.html() || '')
		.trim()
		.split('\r\n')
		.map((li) => `\t\t\t${li.trim()}`)
		.join('\r\n');

	const secMenu = ($('div.module-menu-section ul')
		.first()
		.html() || '')
		.trim()
		.split('\r\n')
		.map((li) => `\t\t\t${li.trim()}`)
		.join('\r\n');
		//extract(/<div\sclass="span-\d\smodule-menu-section.*?">[\s\S]+?<ul>[\s\S]+?(<li[\s\S]+?)\s*?<\/ul>/);

	const nav = extractNavItems($);
	//const nav = {
	//	prevPage:
	//		extract(/embedded-nav.+\s+<a\shref\s?=\s?"(.+?)">\s?(?:previous|page\spr&eacute;c&eacute;dente|page\sprécédente)/i),
	//	homePage:
	//		extract(/embedded-nav.+(?:\r\n)?.+(?:\r\n)?\s+<a\shref\s?=\s?"(.+?)">\s?(?:ret)/i),
	//	nextPage:
	//		extract(/embedded-nav.+(?:\r\n)?.+(?:\r\n)?.+(?:\r\n)?\s+<a\shref\s?=\s?"(.+?)">\s?(?:next|Page\s+suivante)/i),
	//};

	const content =
		extract(/<!--\sSearchable\scontent\sbegins\s\/\sdebut\sde\sla\srecherche\sdu\scont.+?-->\s+?([\s\S]+)<!--\sSearchable\scontent\sends\s\/\sfin\sde\sla\srecherche\sdu\scontenu\s-->/i);

	if (filePath.includes('ace_2050-e.html')) {

	}

	return {
		title,
		metadata,
		langFilename,
		breadcrumbs,
		tomTitle,
		tomNumber,
		pageTitle,
		toc,
		secMenu,
		nav,
		content
	};
}
