import cheerio from 'cheerio';
import transformClasses from './transformClasses';
import convertDivTables from './div-tables';
import { doTOMTransforms, doPostTransforms } from './custom-transforms';

export default function applyWetTransforms(html, filename, isHomepage, manualId) {
	const $ = cheerio.load(html, { decodeEntities: false });

	// do transforms specific to whole TOMs or specific pages
	doTOMTransforms(manualId, $, filename);

	// fix what's new label
	if (isHomepage) {
		const labelRef = $('strong.color-attention').first();
		
		if (labelRef.get(0)) {
			labelRef.get(0).tagName = 'span';
			labelRef.removeClass('color-attention').addClass('label label-info');
		} else {
			console.log(`${filename} has no strong.color-attention`)
		}
	}

	// move improperly nested elements into <li>s
	$('ol > :not(li), ul > :not(li)').each((i, elem) => {
		const $elem = $(elem);

		if ($elem.prev('li').length > 0) {
			$elem.appendTo($elem.prev());
		}
	});

	// add <br/> before each pre.mainframe, or else they end up inline
	$('li > pre.mainframe').before($('<br/>\r\n'));

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
	$('div.module-tool.span-6').removeClass('span-6');
	$('div.module-note, div.module-info, div.module-alert, div.module-attention').each((i, elem) => {
		const elemRef = $(elem);
		elemRef.removeClass('span-2 span-3 span-4 span-5 span-6');

		const noteContent = elemRef.html();

		// Move header to seperate <p> w/ header class
		const noteHeaderStrings = [
			'Note',
			'Remarque',
			'(?:For(?: |&nbsp;))?Example',
			'(?:Par(?: |&nbsp;))?Exemple',
			'Important',
			'Exception',
			'Sample text',
			'Exemple de texte',
			'Verify',
			'Vérifier',
		];
		const notePStartRegex = '<p( [^>]+)?>\\s*?(\\**?)\\s*?<strong>\\s*?';
		const headerStringsRegex = `(\\**?(?:${noteHeaderStrings.join('|')})s?(?:(?:\\s*|&nbsp;)?#?\\d+\\*?)?)`;
		const headerEndRegex = '([^:\\r\\n\\d]*?)(?:&nbsp;)?(:|</strong>)';
		const headerRegex = new RegExp(`${notePStartRegex}${headerStringsRegex}${headerEndRegex}`, 'gi');

		const convertedContent = noteContent
			.replace(/<\/strong>(\s*|&nbsp;)<strong>/g, '$1')
			.replace(headerRegex, '<h3$1>$2$3</h3>\r\n<p><strong>$4$5')
			.trim()
			.replace(/(<h3[^>]*>.+?<\/h3>\s*<p[^>]*>)\s*(?:&nbsp;)?<strong>(?:\s+|&nbsp;)?\s*:\s*(?:&nbsp;)?\s*/g, '$1<strong>')
			.replace(/(<h3[^>]*>.+?<\/h3>\s*<p[^>]*>)\s*(?:&nbsp;)?<strong>\s*(?:&nbsp;)?\s*<\/strong>\s*/g, '$1')
			.replace(/(<h3[^>]*>.+?<\/h3>\s*<p[^>]*>)\s*(?:&nbsp;)?\s*:\s*(?:&nbsp;)?\s*/g, '$1')
			.replace(/(<h3[^>]*>)\s*(?:&nbsp;)?\s*/g, '$1');

		elemRef.html(convertedContent);

		elemRef
			.find('h3')
			.each((i, header) => {
				header.tagName = 'p';
				$(header).addClass('h3');
			});

		elemRef
			.find('strong')
			.filter((i, strong) => {
				const text = $(strong).text().trim();
				return !text || /^&nbsp;$/.test(text);
			})
			.remove();

		elemRef
			.find('p')
			.filter((i, p) => !$(p).html())
			.remove();

		if (elemRef.children('p.h3').length > 0) {
			const header = $(elemRef.children('p.h3').first());

			// add colon to alerts that should have one
			if (/For(?:\s|&nbsp;)example/i.test(header.text())) {
				header.html(header.html() + ':');
			} else if (/Par(?:\s|&nbsp;)exemple/i.test(header.text())) {
				header.html(header.html() + ' :');
			}

			const firstPara = $(elemRef.children().get(1));
			let trimmedPara = firstPara.html().replace(/^\s*(?:&nbsp;)?\s*/, '');
			firstPara.html(trimmedPara);

			if (/^(?!\r?\n)\s/.test(firstPara.text())) {
				const paraHtml = firstPara.html();

				firstPara.html(paraHtml.replace(/^(<[^>]+?>)\s+/, '$1'));
			}
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

	// add list classes
	// add 'lst-lwr-alph' and 'lst-lwr-rmn' to lvl 2 and 3 <ol>s, respectively
	$('li > ol').filter((i, elem) => $(elem).parentsUntil(':not(li, ol, ul)').filter(':not(div)').length === 2) // test for any bugs coming from filtering out divs
		.addClass('lst-lwr-alph');
	$('li li > ol').filter((i, elem) => $(elem).parentsUntil(':not(li, ol, ul)').filter(':not(div)').length === 4)
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

		tableRef
			.find('.row-start, .row-end')
			.each((i, elem) => $(elem).removeClass('row-start').removeClass('row-end'));
	});

	convertDivTables($, filename);

	// add table classes
	$('table').each((i, table) => $(table).addClass('table table-bordered'));
	$('th').each((i, th) => {
		const $th = $(th);
		const thClass = $th.attr('class') || '';
		if (!thClass.includes('background')) {
			$th.addClass('bg-primary');
		}
		if (!thClass.includes('align-center')) {
			$th.addClass('text-center');
		}
	});

	//
	$('td, th')
		.filter((i, t) => $(t).children().last('p').length === 1)
		.each((i, t) => $(t).children().last().addClass('margin-bottom-none'));

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

	$('li').filter((i, li) => $(li).find('.span-1, .span-2, .span-3, .span-4, .span-5, .span-6').length > 0)
		.each((i, li) => {
			const $li = $(li);

			if (/(?:^| )span-/.test($li.children().last().attr('class'))) {
				$li.append('<div class="clear"></div>');
			}
		});

	$('div[class*=border-span-]').each((i, brdr) => $(brdr).children().first().addClass('mrgn-tp-md'));

	transformClasses($);

	// misc formatting and tidying

	// add margin to first child of "brdr-lft brdr-rght brdr-tp brdr-bttm"

	// need to re-parse html for whatever reason
	const $$ = cheerio.load($.html(), { decodeEntities: false });

	// add margins to li children
	$$('li > p, li > div, li img, li table').filter((i, el) => {
		const $el = $(el);

		// don't add margin to table if it has a "figure" label
		if (el.tagName === 'table') {
			if ($el.prev('p').length === 1 && /figure/i.test($el.prev().text()) || $el.children('label').length !== 0) {
				return false;
			}
		}

		return !/mrgn-tp-md|clearfix/.test(el.attribs.class) && !$(el).prev().hasClass('mrgn-bttm-0')
	})
		.addClass('mrgn-tp-md');

	removeMultipleMargins($$);
	doPostTransforms(manualId, $$, filename);

	return $$.html();
}

function removeMultipleMargins($) {
	const keepLargestMarginUnlessZero = ($, side) => {
		const mrgnPrefix = `mrgn-${side}-`;

		const mrgn0 = mrgnPrefix + '0';
		const mrgnSm = mrgnPrefix + 'sm';
		const mrgnMd = mrgnPrefix + 'md';
		const mrgnLg = mrgnPrefix + 'lg';

		const $elems =
			$(`.${mrgn0}.${mrgnSm}, .${mrgn0}.${mrgnMd}, .${mrgn0}.${mrgnLg}, .${mrgnSm}.${mrgnMd}, .${mrgnSm}.${mrgnLg}, .${mrgnMd}.${mrgnLg}`);

		$elems.each((i, elem) => {
			const $elem = $(elem);

			if (new RegExp(`${mrgn0}`).test($elem.attr('class'))) {
				$elem.removeClass(`${mrgnLg} ${mrgnMd} ${mrgnSm}`);
			}

			if (new RegExp(`${mrgnLg}`).test($elem.attr('class'))) {
				$elem.removeClass(`${mrgnMd} ${mrgnSm}`);
			}

			if (new RegExp(`${mrgnMd}`).test($elem.attr('class'))) {
				$elem.removeClass(mrgnSm);
			}
		})
	};

	keepLargestMarginUnlessZero($, 'tp');
	keepLargestMarginUnlessZero($, 'rght');
	keepLargestMarginUnlessZero($, 'bttm');
	keepLargestMarginUnlessZero($, 'lft');
}