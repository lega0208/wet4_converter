
export default function convertDivTables($) {
	const spansSelector = '.span-2, .span-3, .span-4, .span-5, .span-6';
	const borderSpansSelector = '.border-span-1, .border-span-2, .border-span-3, .border-span-4, .border-span-5';
	const getSpanNum = ($elem) => Number($elem.attr('class').replace(/.*(?:border-)?span-(\d).*/, '$1'));
	const addNums = (nums = []) => nums.reduce((total, num) => total + num, 0);

	// also handle no wrappers (remove all border spans within the wrappers, then check for border spans)
	const wrappers = $(spansSelector)
		.has(borderSpansSelector)
		.filter((i, wrapper) => $(wrapper).children(borderSpansSelector).length > 0);

	wrappers.each((i, wrapper) => {
		const $w = $(wrapper);
		const spanNums = [];
		const wrapperSpan = getSpanNum($w); // debug dis shit
		let currentChild = $w.children(borderSpansSelector).first();

		$w.find('.cn-invisible, .invisible').remove();

		while (addNums(spanNums) < wrapperSpan && currentChild.nextAll().length > 0) {
			spanNums.push(getSpanNum(currentChild));
			currentChild = currentChild.nextAll(':not(.clear)').first();
		}

		const spanTotal = addNums(spanNums);

		const isTableWrapper =
			(spanTotal > wrapperSpan) || (spanTotal === wrapperSpan && currentChild.nextAll(':not(.clear)').length > 0);

		if (isTableWrapper) {
			// parse table and replace wrapper with table
			$w.before('<table class="table table-bordered"/>');
			const newTable = $w.prev();
			const headers = $w.find('.background-accent, .background-light');

			if (headers.length > 0) {
				newTable.append('<tr/>');
				const headerRow = newTable.children().first();

				headers.each((i, header) => {
					const $h = $(header);
					$(`<th class="bg-primary text-center">${$h.html()}</th>`).appendTo(headerRow);
					$h.remove();
				});
			}

			let rowSpans = [];

			$w.children().each((i, cell) => {
				const $c = $(cell);
				const spanNum = getSpanNum($c);

				if (addNums([...rowSpans, spanNum]) > wrapperSpan || rowSpans.length === 0) {
					newTable.append('<tr/>');
					rowSpans = [];
				}

				newTable.children().last().append(`<td>${$c.html()}</td>`);
				$c.remove();
				rowSpans.push(spanNum);
			});

			$w.remove();
		} else {
			const isNewTable = $w.prev('table.newtable').length === 0;

			if (isNewTable) $w.before('<table class="table table-bordered newtable"/>');

			const $table = $w.prev();

			$table.append('<tr/>');
			const row = $table.children().last();

			$w.children().each((i, cell) => {
				const $c = $(cell);

				if ($c.hasClass('background-accent') || $c.hasClass('background-light')) {
					row.append(`<th class="bg-primary text-center">${$c.html()}</th>`);
				} else if ($c.find('.background-accent, .background-light').length > 0) {
					const header = $c.children().first();
					row.append(`<th class="bg-primary text-center">${header.html()}</th>`);
					header.remove();

					if (!row.next().length)
						row.after(`<tr/>`);
					row.next().append(`<td>${$c.html()}</td>`);
				} else {
					row.append(`<td>${$c.html()}</td>`);
				}

			});

			const nextSibling = $w.next();
			const nextNextSibling = nextSibling.next();

			if (nextSibling.length > 0 // check whether next sibling is a div.clear between rows, and if so, remove it.
				&& nextSibling.hasClass('clear')
				&& nextNextSibling.length > 0
				&& nextSibling.next(spansSelector).has(borderSpansSelector).length > 0
				&& nextNextSibling.find('.background-accent, .background-light').length === 0) {
				nextSibling.remove();
			}

			$w.remove();
		}
	});

	$('table.newtable').removeClass('newtable');
}