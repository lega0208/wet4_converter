import cheerio from 'cheerio';
import transformClasses from './transformClasses';
import convertDivTables from './div-tables';
import { doTOMTransforms } from './custom-transforms';

export default function applyWetTransforms(html, filename, isHomepage, manualId) {
	const $ = cheerio.load(html, { decodeEntities: false });

	// do transforms specific to whole TOMs or specific pages
	doTOMTransforms(manualId, $, filename);

	// fix what's new label
	if (isHomepage) { // isHomepage is true when it's not????
		const labelRef = $('strong.color-attention').first();
		
		if (labelRef.get(0)) {
			labelRef.get(0).tagName = 'span';
			labelRef.removeClass('color-attention').addClass('label label-info');
		} else {
			console.log(`${filename} has no strong.color-attention`)
		}
	}

	// transform tabs
	$('ul.tabs').each((i, tabTitles) => {
		const tabTitlesRef = $(tabTitles);
		const tabTitleMap = tabTitlesRef
			.find('a')
			.toArray()
			.reduce((acc, a) => {
			acc[a.attribs.href.replace('#', '')] = $(a).text();
			return acc;
		}, {});

		const parent = tabTitlesRef.parent();
		parent.addClass('wb-tabs').removeAttr('id');

		const grandparent = parent.parent();

		if (grandparent.get(0).tagName === 'div' && grandparent.attr('class').includes('span-')) {
			grandparent.replaceWith(parent);
		}

		const tabsPanel = tabTitlesRef.siblings('div.tabs-panel').first();

		tabTitlesRef.remove();

		tabsPanel.removeClass('tabs-panel');
		tabsPanel.addClass('tabpanels');

		tabsPanel.children().each((i, panel) => {
			const panelRef = $(panel);

			panelRef.prepend(`<summary>${tabTitleMap[panelRef.attr('id')]}</summary>`);

			panelRef.removeAttr('class');

			panel.tagName = 'details';
		});
	});

	// remove div.clear at end of page, already part of the template
	const lastChild = $(':root').last();
	if (lastChild.get(0) && lastChild.get(0).tagName === 'div' && (lastChild.get(0).attribs.class || '').includes('clear')) {
		lastChild.remove();
	}

	// transform notes
	$('div.module-note, div.module-info').each((i, elem) => {
		const elemRef = $(elem);
		elemRef.removeClass('module-note module-info span-2 span-3 span-4 span-5 span-6');
		elemRef.addClass('alert alert-info');

		const noteContent = elemRef.html();

		// Move header to seperate <p> w/ header class
		const convertedContent =
			noteContent.replace(
				/<p( id=".+?")?>(\**?)<strong>((?:Note|Remarque|Example|Exemple)(?:(?:\s*|&nbsp;)?#?\d+)?)([^:\r\n\d]*?)(?:&nbsp;)?:/gi,
				'<p$1 class="h3">$2$3</p>\r\n'
				+ '<p><strong>$4'
			).trim();
		elemRef.html(convertedContent);
		elemRef.find('strong').filter((i, strong) => !$(strong).text().trim()).remove();
		if (elemRef.children('p.h3').length > 0) {
			const firstPara = $(elemRef.children().get(1));
			const trimmedPara = firstPara.html().replace(/^\s*(?:&nbsp;)?\s*/, '');
			firstPara.html(trimmedPara);
		}

		// split into multiple notes if necessary
		const noteHeaders = elemRef.find('p.h3');
		let currentNote = elemRef;
		noteHeaders.each((i, header) => {
			if (noteHeaders.length > 1 && i === 0) {
				currentNote.addClass('mrgn-bttm-0');
				currentNote.attr('class', currentNote.attr('class').replace(/(?:^| )margin-bottom-\S+/, ''));
			}

			if (i !== 0) {
				const headerRef = $(header);
				const newNote = currentNote.clone().empty();
				newNote.attr('class', newNote.attr('class').replace(/(?:^| )margin-top-\S+/, ''));
				currentNote.after(newNote);

				const noteItems = headerRef.add(headerRef.nextUntil('p.h3'));
				noteItems.each((i, noteItem) => {
					const $noteItem = $(noteItem);
					$noteItem.html($noteItem.html().replace(/^\s*(?:&nbsp;)?\s*/g, ''));
				});
				noteItems.appendTo(newNote);

				currentNote.addClass('mrgn-bttm-0');
				currentNote.attr('class', currentNote.attr('class').replace(/(?:^| )margin-bottom-\S+/, ''));

				if (i === noteHeaders.length - 1) {
					newNote.removeClass('mrgn-bttm-0');
				}

				currentNote = newNote;
			}
		});

		const nextSiblingRef = currentNote.next();

		if (nextSiblingRef.hasClass('clear')) {
			nextSiblingRef.remove();
		}

		// fix bottom margins if nested in a list
		if (elemRef.parent().get(0) && elemRef.parent().get(0).tagName === 'li') {
			elem.attribs.class = elem.attribs.class.replace(/(?:^| )margin-bottom-\S+/, '');
		}

		// if prev sibling uses grid, add clearfix
		const prevSibling = elemRef.prev();
		if (prevSibling.get(0) && prevSibling.get(0).attribs.class && prevSibling.get(0).attribs.class.includes('span-')) {
			elemRef.before('<div class="clearfix" />');
		}
	});

	// remove spans and clears from other modules, fix bottom margins if nested in a list
	$('div.module-info, div.module-tool, div.module-alert, div.module-attention').each((i, elem) => {
		const elemRef = $(elem);
		elemRef.removeClass('span-2 span-3 span-4 span-5 span-6');

		const nextSiblingRef = elemRef.next();

		if (nextSiblingRef.hasClass('clear')) {
			nextSiblingRef.remove();
		}

		if (elemRef.parent().get(0) && elemRef.parent().get(0).tagName === 'li') {
			elem.attribs.class = elem.attribs.class.replace(/(?:^| )margin-bottom-\S+/, '');
		}
	});

	// add list classes
	// add 'lst-lwr-alph' and 'lst-lwr-rmn' to lvl 2 and 3 <ol>s, respectively
	$('li > ol').filter((i, elem) => $(elem).parentsUntil(':not(li, ol, ul)').length === 2)
		.addClass('lst-lwr-alph');
	$('li li > ol').filter((i, elem) => $(elem).parentsUntil(':not(li, ol, ul)').length === 4)
		.addClass('lst-lwr-rmn');

	$('.row.start').each((i, elem) => (elem.attribs.class = elem.attribs.class.replace('row start', 'row-start')));

	// for "well tables" (probably only in TOM2000)
	$('.well-table').each((i, wellTable) => {
		const tableRef = $(wellTable);

		tableRef.find('.border-span-1, .border-span-2, .border-span-3, .border-span-4, .border-span-5, .border-span-6')
			.each((i, div) => {
				const divRef = $(div);

				div.attribs.class = div.attribs.class.replace(/( border-span-\d|border-span-\d )/, '');

				if (divRef.hasClass('background-light')) {
					divRef.removeClass('background-light').addClass('well well-sm brdr-rds-0 mrgn-bttm-0');
				} else if (!!divRef.text().trim()) {
					divRef.addClass('panel panel-default panel-body brdr-rds-0 mrgn-bttm-0');
				}
			});
		tableRef.find('.row-start, .row-end').each((i, elem) => $(elem).removeClass('row-start').removeClass('row-end'));
	});

	convertDivTables($);

	// add table classes
	$('table').each((i, table) => $(table).addClass('table table-bordered'));
	$('th').each((i, th) => {
		const thRef = $(th);
		const thClass = thRef.attr('class') || '';
		if (!thClass.includes('background')) {
			thRef.addClass('bg-primary');
		}
		if (!thClass.includes('align-center')) {
			thRef.addClass('text-center');
		}
	});

	//$('.grid').each((i, elem) => {
	//	const elemRef = $(elem);
	//
	//	elemRef.attr('class', 'container mrgn-tp-md mrgn-bttm-md');
	//	const rowStartRefs = elemRef.children('.row-start');
	//
	//	rowStartRefs.each((i, rowStart) => {
	//		const rowStartRef = $(rowStart);
	//		const restOfRow = rowStartRefs.get(i + 1) ? rowStartRef.nextUntil(rowStartRefs.get(i + 1)) : rowStartRef.nextAll();
	//		const rowElem = $('<div class="row" />');
	//		rowStartRef.wrap(rowElem);
	//		rowStartRef.removeClass('row-start');
	//		restOfRow.removeClass('row-end');
	//		restOfRow.appendTo(rowElem);
	//	});
	//});

	// clean up imgs - remove width/height attribs, unwrap from <p>s
	$('img').each((i, img) => {
		const imgRef = $(img);
		imgRef.removeAttr('width').removeAttr('height');
		if (imgRef.parent().get(0) && imgRef.parent().get(0).tagName === 'p' && imgRef.parent().text().trim() === '') {
			imgRef.parent().replaceWith(imgRef);
		}
		if (imgRef.parents().length > 0) {
			const parentRef = imgRef.parent();

			if (parentRef.children().length === 1 && parentRef.attr('class') && parentRef.attr('class').includes('span-')) {
				imgRef.addClass(parentRef.attr('class'));
				parentRef.replaceWith(imgRef);
			}
		}
		if (!img.attribs.class || img.attribs.class && !img.attribs.class.includes('margin-bottom')) {
			imgRef.addClass('mrgn-bttm-md');
		}
	});

	transformClasses($);

	// misc formatting and tidying

	// todo: if multiple mrgn classes, only keep the biggest one

	// need to re-parse html for whatever reason
	const $$ = cheerio.load($.html(), { decodeEntities: false });

	// move improperly nested elements into <li>s
	$$('ol > :not(li), ul > :not(li)').each((i, elem) => {
		const $elem = $$(elem);

		if ($elem.prev('li').length > 0) {
			$elem.appendTo($elem.prev());
		}
	});

	// add margins to li children
	$$('li > p, li > div, li img, li table')
		.filter((i, el) => !$(el).hasClass('mrgn-tp-md') && !$(el).prev().hasClass('mrgn-bttm-0'))
		.addClass('mrgn-tp-md');

	return $$.html();
}