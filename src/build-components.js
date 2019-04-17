import { formatHtml } from './util';
import cheerio from 'cheerio';

export const buildNav = (navProps, lang, tomNumber) => {
	const secMenuWords = lang === 'eng' ? 'Section menu' : 'Menu de section';
	let navItems = '';

	if (navProps.prevPage) {
		const prevPageContent = '<span class="glyphicon glyphicon-arrow-left"></span>&nbsp;' + (
			lang === 'eng'
				? `Previous Page <span class="wb-inv"> of <abbr title="Taxation Operations Manual">TOM</abbr> ${tomNumber}</span>`
				: `Page précédente <span class="wb-inv"> du <abbr title="Manuels des opérations de l'impôt">MOI</abbr> ${tomNumber}</span>`
		);

			navItems += `	<li><a class="btn btn-default mrgn-btm-0 mrgn-rght-0" href="${navProps.prevPage}">${prevPageContent}</a></li>`;
	}

	if (navProps.nextPage) {
		if (!!navItems) {
			navItems += '\n';
		}

		const nextPageContent = (
			lang === 'eng'
				? `Next Page <span class="wb-inv"> of <abbr title="Taxation Operations Manual">TOM</abbr> ${tomNumber}</span>`
				: `Page suivante <span class="wb-inv"> du <abbr title="Manuels des opérations de l'impôt">MOI</abbr> ${tomNumber}</span>`
			) + ' <span class="glyphicon glyphicon-arrow-right"></span>';

		navItems += `	<li><a class="btn btn-default mrgn-top-0 mrgn-lft-0" href="${navProps.nextPage}">${nextPageContent}</a></li>`;
	}

	const nav =
		`\
<a href="#section-menu" aria-controls="section-menu" class="btn btn-default overlay-lnk mrgn-bttm-0" role="button"><span class="glyphicon glyphicon-list"></span> ${secMenuWords}</a>
<ul class="pager mrgn-tp-0">
${navItems}
</ul>`;

	return (navProps.prevPage || navProps.nextPage) ? nav : '';
};

export const buildSecMenu = (secMenu, lang, tomTitleLink, isHomepage) => {
	if (isHomepage) return '';

	const title = lang === 'eng' ? 'Section menu' : 'Menu de section';

	return `\
<section id="section-menu" class="wb-overlay modal-content overlay-def wb-panel-r">
	<header class="modal-header">
		<h2 class="modal-title">${title}</h2>
	</header>
	<div class="modal-body">
		<h3 class="mrgn-rght-md mrgn-tp-0 mrgn-bttm-md">${tomTitleLink}</h3>
		<ul class="list-unstyled mrgn-rght-md">
${
		formatHtml(secMenu.replace(/\r\n/g, '').replace(/<\/li><li/g, '</li>\r\n<li'))
			.split('\r\n')
			.map((li) => `\t\t\t${li.trim()}`)
			.join('\r\n')
}
		</ul>
	</div>
</section>`;
};

export const buildToc = (tocLinks, lang) => {
	const $ = cheerio.load(tocLinks, { decodeEntities: false });

	// manipulate as necessary
	$('li:has([class*=col-md-])').each((i, li) => {
		const $li = $(li);
		const firstChild = $li.children().first();
		firstChild.after('\r\n<div class="clearfix"></div>');
		$li.children().removeClass('mrgn-tp-md');
	});

	 return tocLinks.trim() ?
		`\
<section class="panel panel-default">
	<header class="panel-heading">
		<h3 class="panel-title">${lang === 'eng' ? 'Table of contents' : 'Table des matières'}</h3>
	</header>
	<div class="panel-body">
${
			formatHtml($.html())
				.split('\r\n')
				.map((li) => `\t\t${li}`)
				.join('\r\n')
			}
	</div>
</section>` : '';
};

export const buildTOMTitleLink = (breadcrumbs) => {
	const aElemRegex = /<a [\s\S]+?<\/a>/;

	const aElem = (aElemRegex.exec(breadcrumbs) || [''])[0];

	if (!aElem) {
		console.error('Error parsing TOM Title link from breadcrumbs.');
	}

	return aElem;
};

export const buildBreadcrumbs = (breadcrumbs, pageTitle, isHomepage) => {
	if (isHomepage) { // if homepage, unwrap the title
		const bcLines = breadcrumbs.split('\r\n');
		bcLines[bcLines.length - 1] = bcLines[bcLines.length - 1].replace(/<a[^>]+?>(.+?)<\/a>/, '$1');

		return bcLines.join('\r\n');
	}
	return breadcrumbs + '\r\n\t\t\t\t\t' + `<li>${pageTitle}</li>`
};

export const buildAttachment = (attachment) => {

	return attachment.text && attachment.uri
		? `
<a href="${attachment.uri}" class="btn btn-default pull-right">
\t<span class="fa fa-download"></span> ${attachment.text}
</a>
` : '';
};