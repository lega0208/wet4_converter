
export default ($) => {
	const $steps =
		$('.span-6')
			.filter(':not(.module-note, .footnote-container)')
			.filter((i, el) => /(?:Step|(?:&Eacute;|É)tape|Note)(?:\s+#|&nbsp;#)?(?:\s+|&nbsp;)\d/i.test($(el).text()));

	$steps.each((i, el) => {
		const $el = $(el);

		// get the "Step"'s id
		const idElems = $el.find('.span-1 > p[id], .span-1[id], .span-1 > p > a[id]');

		if (idElems.length > 1) {
			console.log('wowo, multiple ids in a single "Step"!!');
			idElems.each((i, idEl) => console.log(idEl.attribs.id));
		} else if (!$el.attr('id') && idElems.length === 0 && !/(?:Step|(?:&Eacute;|É)tape|Note)(?:\s+#|&nbsp;#)?(?:\s+|&nbsp;)1/i.test($(el).text())) {
			console.log('no id????');
		}
		const id = $el.attr('id') || idElems.first().attr('id');

		const stepSpan = $el.children('.span-1');

		if (stepSpan.length > 1) {
			console.log('More than 1 span-1?');
		}

		const title = stepSpan.text().trim() || 'Step X';

		const content = $el.children(':not(.span-1.background-accent)').html().trim();

		const stepHtml = $(`\
<div id="${id}" class="panel panel-primary mrgn-bttm-sm">
	<div class="panel-heading">
		<p class="lead mrgn-bttm-0">${title}</p>
	</div>
	<div class="mrgn-bttm-0 panel-body">
		<div class="col-md-9 col-md-push-1">
			${content}
		</div>
		<div class="clearfix"></div>
	</div>
</div>
`);
		if ($el.next('.clear').length === 1) $el.next().remove();

		$el.replaceWith(stepHtml);
	});
}