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
	TOM1940: ($, filename) => {
		if (filename.includes('exhibita')) {
			$('.indent-large').removeClass('indent-large');
		}
	},
	TOM1921: ($) => $('table.indent-large, table.indent-xlarge').removeClass('indent-large indent-xlarge'),
	TOM4031,
	TOM4033: ($) => transformFootnotes($),
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
	TOM9850: ($, filename) => {
		if (filename.includes('tpc_5')) {
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		}
	},
	TOM9970: ($) => {
		transformSteps($);
		transformFootnotes($); // ???
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
	}
};

export const doPostTransforms =
	(manualId, $, filename) => postTransforms.hasOwnProperty(manualId)
		? postTransforms[manualId]($, filename)
		: null;
