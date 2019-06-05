
export default ($) => {
	const fnContainers = $('.footnote-container');

	fnContainers.each((i, fnContainer) => {
		const $fnContainer = $(fnContainer);
		const $newFnContainer = $('<aside class="wb-fnote" role="note"><h2>Footnotes</h2><dl></dl></aside>');

		$fnContainer.before($newFnContainer);
		const dl = $newFnContainer.find('dl').first();

		$fnContainer.children('p').each((i, p) => {
			const $p = $(p);
			const pClone = $p.clone();
			pClone.find('.footnote').remove();
			const fnTitle = pClone.text().trim();
			const fnContent = $p.children('span.footnote').first();
			const fnId = $p.attr('id');

			if (!fnTitle || !fnContent.html() || !fnId)
				console.error('Title/content/id not found in footnote');

			$(`<dt>${fnTitle}</dt>`).appendTo(dl);

			const dd = $(`<dd id=${fnId}>`);
			dd.appendTo(dl);
			fnContent.appendTo(dd);
			fnContent.removeClass('footnote');
			fnContent.get(0).tagName = 'p';

			const fnAnchors = fnContent.find('a');
			if (fnAnchors.length > 1) console.log('more than 1 <a> in footnote?');

			const returnLinkRegex =
				/\((Return to footnote |Retourner à la source de la note de bas de page )(\d)( source(?: paragraph)?)?\)/i;
			const replaceText ='<span class="wb-inv">$1</span>$2<span class="wb-inv">$3</span>';
			const newHtml = fnAnchors.last().html().replace(/&nbsp;/g, ' ').replace(returnLinkRegex, replaceText);

			fnAnchors.last().html(newHtml);
			fnAnchors.find('.wb-inv').filter((i, span) => !$(span).html()).remove();
			fnAnchors.last().wrap('<p class="fn-rtn"></p>').parent().insertAfter(fnContent);

			$(`a[href=#${fnId}]`).each((i, footnote) => {
				const $footnote = $(footnote);
				$footnote.attr('class', 'fn-lnk');
				$footnote.html($footnote.html().replace(/(Footnote |Note de bas de page )(\d)/, '<span class="wb-inv">$1</span>$2'));
				$footnote.wrap('<sup/>');
			});
		});
	});

	fnContainers.remove();
}