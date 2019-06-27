import transformSteps from './steps';
import transformFootnotes from './footnotes';
import TOM4031 from './tom-transforms/tom4031';

// object that maps tom names to their specified transform functions
const tomTransforms = {
	TOM1911: ($, filename) => {
		$('a').each((i, a) => {
			const $a = $(a);
			const link = $a.attr('href');

			if (!link) {
				console.log(`Link with no href in ${filename}:\n${$a.parent().html()}`);
			} else {
				$a.attr('href', link.replace(/\/\//g, '/'));
			}
		});
		transformFootnotes($);
	},
	TOM1913: ($) => {
		transformSteps($);
		$('#undefined').removeAttr('id');
	},
	TOM1940: ($, filename) => {
		if (filename.includes('exhibita')) {
			$('.indent-large').removeClass('indent-large');
		}
	},
	TOM1921: ($) => $('table.indent-large, table.indent-xlarge').removeClass('indent-large indent-xlarge'),
	TOM4031,
	TOM4033: ($) => transformFootnotes($),
	TOM404650: ($, filename) => {
		if (filename.includes('sec116_4046.(50)4')) {
			const divs = $('.equalize-span-6');
			divs.addClass('equalize span-6');
			divs.removeClass('equalize-span-6');
		}

		if (filename.includes('sec212_4046.(50)5')
			|| filename.includes('sec216_4046.(50)6')
			|| filename.includes('sec217_4046.(50)7')) {
			const span4Tables = $('.equalize-span-4');
			span4Tables.addClass('equalize span-4');
			span4Tables.removeClass('equalize-span-4');

			const span5Tables = $('.equalize-span-5');
			span5Tables.addClass('equalize span-5');
			span5Tables.removeClass('equalize-span-5');

			const pdfButtons = $('a[href*=pdf]');

			pdfButtons.each((i, pdfBtn) => {
				const $pdfBtn = $(pdfBtn);
				$pdfBtn.addClass('btn btn-default');
				$pdfBtn.html(`<span class="fa fa-download"></span> ${$pdfBtn.html()}`);
				$pdfBtn.parent().parent().replaceWith($pdfBtn);
			});
		}

		if (filename.includes('ded_4046.(50)10')) {
			const pdfButtons = $('a[href*=pdf]');

			pdfButtons.each((i, pdfBtn) => {
				const $pdfBtn = $(pdfBtn);
				$pdfBtn.addClass('btn btn-default');
				$pdfBtn.html(`<span class="fa fa-download"></span> ${$pdfBtn.html()}`);
				$pdfBtn.parent().parent().replaceWith($pdfBtn);
			});
		}

		transformSteps($);
	},
	TOM4082: ($, filename) => {
		if (filename.includes('4082_5-procident')) {
			transformSteps($);
		}
	},
	TOM4092: ($, filename) => {
		if (filename.includes('exhibitB_4092NR')) {
			$('.background-light').each((i, el) => {
				const $el = $(el);
				$el.removeClass('background-light');
				$el.find('.align-center').each((i, p) => {
					const $p = $(p);
					const lastP = $p.nextAll().length === 0 ? $p : $p.nextAll().last();
					lastP.addClass('mrgn-bttm-0');
				});
				$el.html(`<div class="bg-info">${$el.html()}</div>`);
			});
		}

		transformSteps($);
	},
	TOM40921: ($, filename) => {
		if (filename.includes('exhibit_a')) {
			console.log('exhibit_a');
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		}
	},
	TOM409231: ($, filename) => {
		if (filename.includes('homepage')) {
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		}
		transformSteps($);
	},
	TOM409232: ($, filename) => {
		if (filename.includes('homepage')) {
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		}
		transformSteps($);
	},
	TOM9816: ($, filename) => {
		if (filename.includes('asls_98(16)')) {
			$('.module-attention > ul > li:has(strong)').each((i, li) => {
				const $li = $(li);
				const note = $li.parent().parent();
				note.prepend(`<p>${$li.html()}</p>`);
				$li.parent().remove();
			});
		}
		transformSteps($);
	},
	TOM9850: ($, filename) => {
		if (filename.includes('tpc_5')) {
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		}
	},
	TOM9970: ($, filename) => {
		if (filename.includes('overview_9971')) {
			transformSteps($);
			$('[id=undefined]').removeAttr('id');
		} else if (filename.includes('correspondence_9976')) {
			transformSteps($);
			transformFootnotes($);
		}
	},
};

export const doTOMTransforms =
	(manualId, $, filename) => tomTransforms.hasOwnProperty(manualId)
		? tomTransforms[manualId]($, filename)
		: null;

const postTransforms = {
	TOM4033: ($, filename) => {
		if (filename.includes('exh4033-f-')) {
			const $table = $('table');
			
			$('table > :nth-child(3n + 3)').each((i, tr) => {
				const newTable = $('<table class="table table-bordered"/>');
				const rows = $(tr).add($(tr).prevAll());

				rows.each((i, tr) => {
					const $tr = $(tr);
					const header = $tr.children().first();
					header.next().addClass('col-md-9');
					header.addClass('bg-primary text-center col-md-3');
					header.html(header.find('p').html());
					header.get(0).tagName = 'th';
				});
				rows.appendTo(newTable);
				
				$table.before(newTable);
			});
			
			$table.remove();
		}
	},
	TOM4092: ($, filename) => {
		if (filename.includes('exhibitB_4092NR')) {
			const div = $('div.bg-info');
			div.parent().addClass('bg-info');
			div.each((i, div) => $(div).replaceWith($(div).html()));
		}
	},
	TOM404650: ($, filename) => {
		if (filename.includes('sec217_4046.(50)7')) {
			const table = $('table').first();
			const restOfTable = table.nextAll();
			restOfTable.filter((i, el) => el.tagName === 'div' && el.attribs.class.includes('clear')).remove();
			restOfTable.each((i, thisTable) => {
				const $table = $(thisTable);
				$table.find('tr').appendTo(table);
			});
			restOfTable.remove();
			table.find('.bg-primary').removeClass('bg-primary');
			table.find('th').each((i, th) => th.tagName = 'td');
		}
	},
};

export const doPostTransforms =
	(manualId, $, filename) => postTransforms.hasOwnProperty(manualId)
		? postTransforms[manualId]($, filename)
		: null;
