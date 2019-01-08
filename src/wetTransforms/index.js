import cheerio from 'cheerio';
import transformClasses from './transformClasses';

export default function applyWetTransforms(html, isHomepage, print = false) {
	const $ = cheerio.load(html, { decodeEntities: false });
	
	// fix what's new label
	if (isHomepage) {
		const labelRef = $('strong.color-attention').first();
		labelRef.get(0).tagName = 'span';
		labelRef.removeClass('color-attention').addClass('label label-info');
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
	if (lastChild.get(0).tagName === 'div' && (lastChild.get(0).attribs.class || '').includes('clear')) {
		lastChild.remove();
	}

	// transform notes
	$('div.module-note').each((i, elem) => {
		const elemRef = $(elem);
		elemRef.removeClass('module-note span-2 span-3 span-4 span-5 span-6');
		elemRef.addClass('alert alert-info');

		// fix note headers
		elemRef.children('p').each((i, p) => {
			const pRef = $(p);

			const firstStrong = pRef.find('strong').first();
			if (/note|remarque/i.test(firstStrong.text())) {
				const strong = firstStrong.get(0);
				strong.tagName = 'p';
				firstStrong.addClass('h3');
				firstStrong.text(firstStrong.text().replace(/((?:note|remarque)(?: ?\d)?)\s*:\s*/i, '$1'));
				firstStrong.insertBefore(p);
				pRef.html(pRef.html().replace(/^\s*:\s*/, '').trim());
			}
		});

		// split into multiple notes if necessary
		const noteHeaders = elemRef.find('p.h3');
		let currentNote = elemRef;
		noteHeaders.each((i, header) => {
			if (noteHeaders.get(i + 1)) {
				currentNote.addClass('mrgn-bttm-0');
			}

			if (i !== 0) {
				const headerRef = $(header);
				const newNote = currentNote.clone().empty();
				currentNote.after(newNote);

				const noteItems = headerRef.add(headerRef.nextUntil('p.h3'));
				noteItems.appendTo(newNote);
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

	$('.div-table').each((i, divTable) => {
		const divTableRef = $(divTable);
		const newTable = $('<table/>');
		divTableRef.before(newTable);

		divTableRef.find('.cn-invisible').remove();

		divTableRef.children().each((i, row) => {
			const rowRef = $(row);

			if (rowRef.hasClass('headers')) {
				const headerRow = $('<tr/>');
				headerRow.appendTo(newTable);

				rowRef.children().each((i, rowChild) => {
					const headerElem = $(rowChild).find('.background-accent').first();
					const headerContent = headerElem.html();
					$(`<th class="text-center bg-primary">${headerContent}</th>`).appendTo(headerRow);
					headerElem.remove();
				});
			}

			const tableRow = $('<tr/>');
			tableRow.appendTo(newTable);

			rowRef.children().each((i, rowChild) => {
				const tdRef = $('<td/>');
				tdRef.appendTo(tableRow);
				$(rowChild).contents().appendTo(tdRef);
			});
		});
		divTableRef.remove();
	});

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

	//const rowStarts = $('.row-start');
	//rowStarts.each((i, elem) => {
	//	const elemRef = $(elem);
	//
	//	const rowWrapper = $('<div class="row"></div>');
	//	const nextRowStart = rowStarts.get(i + 1) || '';
	//	const rowElems = elemRef.add(elemRef.nextUntil(nextRowStart));
	//	elemRef.before(rowWrapper);
	//	rowWrapper.prepend(rowElems);
	//
	//	if (rowWrapper.parent().hasClass('equalize')) {
	//		rowWrapper.parent().removeClass('equalize');
	//		rowWrapper.addClass('equalize');
	//	}
	//
	//	// make sure previous sibling(s) are in rows
	//	rowWrapper.prevAll(':not(.row)').wrap('<div class="row" />');
	//
	//	// move items that aren't "part of the row" to a new row.
	//	const nonRowItems = rowElems.filter('.row-end').nextAll(':not(.row-start)');
	//	if (nonRowItems.length > 0) {
	//		const newRow = $('<div class="row" />');
	//		rowWrapper.after(newRow);
	//		newRow.prepend(nonRowItems);
	//	}
	//});
	$('.grid').each((i, elem) => {
		const elemRef = $(elem);

		elemRef.attr('class', 'container mrgn-tp-md mrgn-bttm-md');
		const rowStartRefs = elemRef.children('.row-start');

		rowStartRefs.each((i, rowStart) => {
			const rowStartRef = $(rowStart);
			const restOfRow = rowStartRefs.get(i + 1) ? rowStartRef.nextUntil(rowStartRefs.get(i + 1)) : rowStartRef.nextAll();
			const rowElem = $('<div class="row" />');
			rowStartRef.wrap(rowElem);
			rowStartRef.removeClass('row-start');
			restOfRow.removeClass('row-end');
			restOfRow.appendTo(rowElem);
		});
	});

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
	});

	transformClasses($);

	return $.html();
}