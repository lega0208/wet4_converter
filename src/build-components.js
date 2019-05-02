import { formatHtml, indent } from './util';
import cheerio from 'cheerio';

export const buildQuicksearchScriptTag = (tomNumber, langFilename) => {
	const filename = tomNumber === '9850'
		? 'rejectsearch_9850'
		: tomNumber === '4092.31'
			? 'eclist_4092.31'
			: tomNumber === '4092.32'
				? 'eclist_4092.32'
				: console.error('invalid tomNumber for quicksearch in ' + langFilename);

	return `\r\n<script src="js/${filename}.js"></script>`;
};

const buildQuicksearchNav = (lang, tomNumber, secMenu, navButtons, langFilename) => {
	const type = tomNumber === '9850' ? 'reject' : 'ec';
	const buttonText = lang === 'eng' ? 'Search' : 'Recherche';
	let title;
	let labelText;
	let placeholderText;
	let errorText;

	// if ec:
	if (lang === 'eng' && type === 'ec') {
		title = '<abbr title="Error clue">EC</abbr> quick search';
		labelText = 'Enter <abbr title="Error clue">EC</abbr> number';
		placeholderText = 'Enter EC number';
		errorText = 'Not a valid <abbr title="Error clue">EC</abbr> number';
	} else if (lang === 'fra' && type === 'ec') {
		title = 'Recherche rapide <abbr title="Indice d\'erreur">IE</abbr>';
		labelText = 'Inscrivez un <abbr title="numéro">no.</abbr> d\'<abbr title="Indice d\'erreur">IE</abbr>';
		placeholderText = 'Inscrivez un no. d\'IE';
		errorText = 'Pas un <abbr title="numéro">no.</abbr> d\'<abbr title="Indice d\'erreur">IE</abbr> valide';
	}
	// if reject:
	else if (lang === 'eng' && type === 'reject') {
		title = '<abbr title="Taxpayer Contact">TPC</abbr> Rejects quick search';
		labelText = 'Enter Reject number';
		placeholderText = 'Enter Reject number';
		errorText = 'Not a valid Reject number';
	} else if (lang === 'fra' && type === 'reject') {
		title = 'Recherche rapide de Rejets <abbr title="Contact avec les Contribuables">CC</abbr>';
		labelText = 'Inscrivez un <abbr title="numéro">no.</abbr> de Rejet';
		placeholderText = 'Inscrivez un no. de Rejet';
		errorText = 'Pas un <abbr title="numéro">no.</abbr> de Rejet valide';
	}

	return `\
<div class="col-md-12${/homepage|tpc_5/.test(langFilename) ? '' : ' mrgn-bttm-sm'}">${navButtons ? '\r\n\t' + secMenu : ''}
	<div class="panel panel-primary pstn-rght-md pstn-tp-md">
		<div class="panel-heading">
			<p class="panel-title h4 mrgn-tp-0">${title}</p>
		</div>
		<div class="mrgn-tp-sm mrgn-bttm-sm mrgn-rght-sm mrgn-lft-sm">
			<form id="${type}search-form" enctype="text/plain" role="form" class="form-inline">
				<div class="form-group">
					<label for="${type}search" class="control-label wb-inv">${labelText}</label>
					<div class="input-group">
						<input type="text" id="${type}search" class="form-control" placeholder="${placeholderText}" />
						<span class="input-group-btn"><button id="${type}search-submit" type="button" class="btn btn-default">${buttonText}</button></span>
					</div>
				</div><br>
				<span id="${type}search-warning" class="label label-danger wb-inv">${errorText}</span>
			</form>
		</div>
	</div>
</div>${navButtons ? '\r\n' + navButtons : ''}
<div class="clearfix"></div>`;
};

export const buildNav = (navProps, lang, tomNumber, hasQuicksearch, langFilename) => {
	const secMenuWords = lang === 'eng' ? 'Section menu' : 'Menu de section';
	let navItems = '';

	if (navProps.prevPage) {
		const prevPageContent = '<span class="glyphicon glyphicon-arrow-left"></span>&nbsp;' + (
			lang === 'eng'
				? `Previous Page <span class="wb-inv"> of <abbr title="Taxation Operations Manual">TOM</abbr> ${tomNumber}</span>`
				: `Page précédente <span class="wb-inv"> du <abbr title="Manuels des opérations de l'impôt">MOI</abbr> ${tomNumber}</span>`
		);

			navItems += `	<li><a class="btn btn-default mrgn-rght-0" href="${navProps.prevPage}">${prevPageContent}</a></li>`;
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

		navItems += `	<li><a class="btn btn-default mrgn-lft-0" href="${navProps.nextPage}">${nextPageContent}</a></li>`;
	}

	const secMenu =
		`<a href="#section-menu" aria-controls="section-menu" class="btn btn-default overlay-lnk mrgn-bttm-0" role="button"><span class="glyphicon glyphicon-list"></span> ${secMenuWords}</a>`;

	const navButtons = (navProps.prevPage || navProps.nextPage)
		? `<ul class="pager mrgn-tp-0">\r\n${navItems}\r\n</ul>`
		: '';

	return !hasQuicksearch
		? navButtons && `${secMenu}\r\n${navButtons}` // if no navButtons, return empty string, else return formatted nav
		: buildQuicksearchNav(lang, tomNumber, secMenu, navButtons, langFilename);
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
		formatHtml(secMenu.replace(/\r\n/g, '')
			.replace(/<\/li><li/g, '</li>\r\n<li'))
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
${formatHtml($.html(), 2)}
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