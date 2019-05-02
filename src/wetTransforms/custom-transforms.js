import transformSteps from './steps';
import TOM4031 from './tom-transforms/tom4031';

// object that maps tom names to their specified transform functions
const tomTransforms = {
	TOM1911: ($, filename) => $('a').each((i, a) => {
		const $a = $(a);
		const link = $a.attr('href');

		if (!link) {
			console.log(`Link with no href in ${filename}:\n${$a.parent().html()}`);
		} else {
			$a.attr('href', link.replace(/\/\//g, '/'));
		}
	}),
	TOM1940: ($, filename) => {
		if (filename.includes('exhibita')) {
			$('.indent-large').removeClass('indent-large');
		}
	},
	TOM1921: ($) => $('table.indent-large, table.indent-xlarge').removeClass('indent-large indent-xlarge'),
	TOM4031,
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
	},
	TOM9850: ($, filename) => {
		if (filename.includes('tpc_5')) {
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		}
	},
};

export const doTOMTransforms =
	(manualId, $, filename) => tomTransforms.hasOwnProperty(manualId)
		? tomTransforms[manualId]($, filename)
		: null;