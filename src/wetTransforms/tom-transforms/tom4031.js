export default ($, filename) => {
	const divTableFiles = [
		'preve_4031.3',
		'forms_4031.4',
		'exh4031-a',
		'exh4031-b',
	];

	if (divTableFiles.includes(filename.replace(/(.+?)-[ef]\.html/, '$1'))) {
		const rowRefs = $('div.span-6.equalize');
		const headerRows = rowRefs.has('div.background-accent');

		//headerRows.each((i, hr) => console.log($(hr).html()));

		headerRows.each((i, headerRow) => {
			const hrRef = $(headerRow);
			hrRef.before('<table class="table table-bordered"/>');
			const tableRef = hrRef.prev();
			const tableHeaderRow = $('<tr/>').appendTo(tableRef);
			hrRef.children().each(
				(i, elem) => $(`<th>${$(elem).find('p').first().html()}</th>`).appendTo(tableHeaderRow)
			);

			const restOfTable =
				headerRows.get(i+1)
					? hrRef.nextUntil(headerRows.get(i+1))
					: hrRef.nextAll();

			restOfTable.find('.cn-invisible').remove();

			restOfTable.each((i, row) => {
				const rowRef = $(row);
				const tableRow = $('<tr/>').appendTo(tableRef);

				rowRef.children().each((i, elem) => {
					const elemRef = $(elem);
					tableRow.append(`<td>${elemRef.contents()}</td>`);
				});
			});
		});

		rowRefs.remove();
		return;
	}

	if (filename.includes('exh4031-d')) {
		const topTableRows = $('div.equalize.span-4').has('.border-span-3');
		const topTableRef = $('<table class="table table-bordered"/>').insertBefore(topTableRows.first());

		topTableRows.each((i, row) => {
			const trRef = $('<tr/>').appendTo(topTableRef);
			$(row).children().each(
				(i, elem) => $(elem).children().each(
					(i, content) => trRef.append(`<td>${$(content).contents()}</td>`)
				)
			);
		});
		topTableRows.remove();

		const bottomTableRows = $('div.equalize.span-6');
		const bottomTableRef = $('<table class="table table-bordered"/>').insertBefore(bottomTableRows.first());
		const nonHeaderRows = bottomTableRows.filter((i) => i !== 0);

		const headerRow = $('<tr/>').appendTo(bottomTableRef);
		bottomTableRows.first().children().each(
			(i, headerCell) => headerRow.append(`<th>${$(headerCell).find('p').first().html()}</th>`)
		);

		nonHeaderRows.each((i, row) => {
			const trRef = $('<tr/>').appendTo(bottomTableRef);
			$(row).children().each(
				(i, elem) => trRef.append(`<td>${$(elem).contents()}</td>`)
			);
		});

		bottomTableRows.remove();
		bottomTableRef.find('.cn-invisible').remove();

		$('table td:last-child').addClass('text-center');

		return;
	}

	if (filename.includes('exh4031-f') || filename.includes('exh4031-g')) {
		let currentTableStart = $('div.span-6.equalize, div.span-5.equalize').first();

		while (currentTableStart.length !== 0) {
			const currentTableEnd = currentTableStart.nextAll('div.clear').first();
			const currentTableRows = currentTableStart.nextUntil(currentTableEnd).add(currentTableStart);

			const tableRef = $('<table class="table table-bordered"/>').insertBefore(currentTableRows.first());
			currentTableRows.each((i, row) => {
				const trRef = $('<tr/>').appendTo(tableRef);
				$(row).children().each((i, child) => trRef.append(`<td>${$(child).contents()}</td>`)
				);
			});

			currentTableStart = currentTableEnd.nextAll('div.span-6.equalize, div.span-5.equalize').first();
			//if (filename.includes('exh4031-g')) {
			//	console.log(currentTableStart);
			//}
		}

		$('table > tr:first-child > td:first-child').addClass('col-md-4');
		$('table > tr:first-child > td:last-child').addClass('col-md-8');
		$('div.equalize.span-6, div.equalize.span-5, div.clear.margin-bottom-large').remove();
		$('table').find('.cn-invisible').remove();

		return;
	}

	if (filename.includes('exh4031-k')) {
		const alphabetNav = $('.embedded-nav').first();
		alphabetNav.find('a').wrap('<li/>');
		alphabetNav.find('.embedded-link-none').each((i, noLink) => {
			const noLinkRef = $(noLink);
			noLinkRef.next().remove();
			noLinkRef.remove();
		});
		alphabetNav.attr('class', 'pagination mrgn-tp-md');
		alphabetNav.get(0).tagName = 'ul';

		$('h2').each((i, h2) => {
			const headerRef = $(h2);
			const gridRef = $(`
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-6">
							<table class="table table-bordered"/>
						</div>
						<div class="col-md-6">
							<table class="table table-bordered"/>
						</div>
					</div>
				</div>
			`)
				.insertAfter(headerRef);
			const gridRowRef = gridRef.find('.row');
			const rowRefs = gridRef.nextUntil('.clear');

			rowRefs.each((i, row) => {
				const rowRef = $(row);

				rowRef.find('.span-2').each((i, elem) => {
					switch (i) {
						case 0:
							const tableRef = gridRowRef.find('table').first();
							const trRef = $('<tr/>').appendTo(tableRef);
							trRef.append(`<td>${$(elem).contents()}</td>`);
							trRef.append(`<td>${$(elem).next().contents()}</td>`);
							break;
						case 1:
							const tableRef2 = gridRowRef.find('table').last();
							const trRef2 = $('<tr/>').appendTo(tableRef2);
							trRef2.append(`<td>${$(elem).contents()}</td>`);
							trRef2.append(`<td>${$(elem).next().contents()}</td>`);
							break;
						default: console.log('whoa a thing happened');
					}
				});
			});
		});
		$('div.span-6, div.span-3, div.clear').remove();
		$('table').find('.cn-invisible').remove()
	}
}