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
	TOM1921: ($) => $('table.indent-large, table.indent-xlarge').removeClass('indent-large indent-xlarge'),
	TOM1940: ($, filename) => {
		if (filename.includes('exhibita')) {
			$('.indent-large').removeClass('indent-large');
		}
	},
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

		if (/ec_(?:442|478|541|2130|2173|2200|2201|2266|2268|2285)/.test(filename)) {
			const links = $('a[href*=Step]');
			const steps = $('[id*=Step]');

			links.each((i, link) => $(link).attr('href', $(link).attr('href').toLowerCase()));

			steps.each((i, step) => $(step).attr('id', $(step).attr('id').toLowerCase()));
		}

		if (/ec_(?:427|442|478|541|2130|2161|2173|2200|2201|2208|2266|2268|2285)/.test(filename)) {
			$('li').filter(':not([class*=margin])').addClass('mrgn-tp-md');
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
		if (filename.includes('exhibitA_4092NR')) {
			$('table').addClass('text-center');
		}
		if (!filename.includes('homepage')) {
			$('li').filter(':not([class*=margin])').addClass('mrgn-tp-md');
			$('p:has(div, ul)').each((i, p) => {
				const $p = $(p);
				$p.children('div, ul').insertAfter($p);
				$p.html($p.html().trim());
				$p.removeClass('margin-bottom-none');
				if (!$p.attr('class')) $p.removeAttr('class');
			});
			$('p.margin-bottom-none, p.indent-small').each((i, p) => {
				const $p = $(p);
				if ($p.next('div.module-note, div.module-attention, ul').length > 0) {
					$p.removeClass('margin-bottom-none');
				}
				if ($p.hasClass('indent-small')) {
					$p.removeClass('indent-small');
				}
				if (!$p.attr('class')) $p.removeAttr('class');
			});
			$('li.indent-xlarge').each((i, li) => {
				const $li = $(li);
				$li.removeClass('indent-xlarge');
				if (!$li.attr('class')) $li.removeAttr('class');
			});
			$('br').filter((i, br) => {
				const $br = $(br);
				if ($br.prev('div.module-note').length > 0) {
					$br.remove();
				}
			});

			transformSteps($);
		}
	},
	TOM40921: ($, filename) => {
		if (filename.includes('exhibit_a')) {
			console.log('exhibit_a');
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		}
	},
	TOM40922: ($, filename) => {
		if (filename.includes('coordinator_4092_22')) transformSteps($);
	},
	TOM409231: ($, filename) => {
		if (filename.includes('home')) {
			const $mod = $('.module-tool');
			$mod.addClass('col-md-8');
			$mod.after('<div class="clearfix"/>');
		} else {
			$('li').filter(':not([class*=margin])').addClass('mrgn-tp-md');
			$('p.margin-bottom-none').each((i, p) => {
				const $p = $(p);
				if ($p.next('div.module-note').length > 0) {
					$p.removeClass('margin-bottom-none');
				}
			});
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
	TOM4200: ($, filename) => {
		if (filename.includes('exhibit_d_42(10)')) {
			transformSteps($);
		}
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
	TOM1970: ($, filename) => {
		if (filename.includes('1976_fedtax')) {
			const figures = [
				//{ section: '1976\\.12', figureNums: ['1'] },
				//{ section: '1976\\.14', figureNums: ['2', '3'] },
				//{ section: '1976\\.33', figureNums: ['1'] },
				//{ section: '1976\\.38', figureNums: ['1', '2'] },
				{ section: '1976\\.51', figureNums: ['1', '2', '3', '4', '5'] },
				{ section: '1976\\.53', figureNums: ['1', '2'] },
				{ section: '1976\\.54', figureNums: ['1'] },
				{ section: '1976\\.55', figureNums: ['1'] },
				{ section: '1976\\.56', figureNums: ['2'] },
				{ section: '1976\\.\\(13\\)', figureNums: ['2'] },
			];

			const $figs = $('p')
				.filter((i, p) => /^Figure( |&nbsp;)\d(?:-|&ndash;)[\d.()]+$/i.test($(p).text().trim())) // find titles
				.filter((i, figTitle) => { // filter out the ones we don't need
					if (figures) {
						for (const { section, figureNums } of figures) {
							for (const figNum of figureNums) {
								const re = new RegExp(`^Figure(?: |&nbsp;)${figNum}(?:-|&ndash;)${section}$`);
								if (re.test($(figTitle).text().trim()))
									return true;
							}
						}
					}
				})
				.map((i, el) => $(el).next().get(0));

			$figs.each((i, fig) => {
				const $fig = $(fig);
				$fig.children('[class*=col-md-]').each((i, row) => {
					const $row = $(row);
					$row.removeClass('wb-eqht');
					$row.attr('class', $row.attr('class').replace(/col-md-\d{1,2}/, 'row'));
				});
			});

		}

		//el.attribs.class = el.attribs.class.replace(/(^| )span-\d/, '$1row');
	},
	TOM3990: ($, filename) => {
		$('div.alert.alert-info.mrgn-tp-0')
			.removeClass('mrgn-tp-0')
			.addClass('mrgn-tp-md');

		if (filename.includes('foa_mft_t1_acc_3992.8')) {
			$('li.mrgn-tp-0, li.mrgn-bttm-0')
				.removeClass('mrgn-tp-0')
				.removeClass('mrgn-bttm-0')
				.addClass('mrgn-tp-md');

			$('pre.mainframe')
				.each((i, mainframe) => $(mainframe).prev('br').remove());
		}
	},
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
			div.parent().addClass('active');
			div.each((i, div) => $(div).replaceWith($(div).html()));
		}
		$('div.alert table').each((i, table) => {
			const $table = $(table);
			$table.addClass('mrgn-bttm-md mrgn-tp-md');
			$table.find('tr:not(:has(th))').addClass('panel');
		});
	},
	TOM40922: ($, filename) => {
		if (/error_clues_\d+/.test(filename)) {
			const $td = $('td');
			$td.find('p[class*=mrgn-tp-]').removeClass('mrgn-tp-md').removeClass('mrgn-tp-lg');
			const ecNums = $td.has('p').filter((i, p) => /^\d+$/.test($(p).text().trim()));
			ecNums.addClass('text-center');

			const $firstTable = $('table').first();
			const otherTables = $firstTable.nextAll('table');
			otherTables.each((i, table) => $(table).contents().appendTo($firstTable));
			otherTables.remove();
		}
	},
	TOM4095: ($, filename) => {
		if (filename.includes('4095.6_1_311')) {
			const $figures = $('.background-light');
			$figures.removeClass('background-light');
			$figures.addClass('panel panel-body panel-default');
			$('div.brdr-tp').has('a[href*=PDF]').after('<div class="clearfix"/>');
		} else if (filename.includes('4095.6_3_309')) {
			const $figures = $('.background-light');
			$figures.removeClass('background-light');
			$figures.addClass('panel panel-body panel-default');
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
	TOM9850: ($, filename) => {
		if (filename.includes('tpc_3_1') || filename.includes('tpc_3_3')) {
			const $imgs = $('img');
			$imgs.addClass('col-md-12');
			$imgs.each((i, img) => {
				const $img = $(img);
				if ($img.next('div.clearfix').length === 0) {
					$img.after('<div class="clearfix"/>');
				}
			});
		}
	},
	TOM9890: ($) => $('li').not('[class*=mrgn-tp-]').addClass('mrgn-tp-md'),
};

export const doPostTransforms =
	(manualId, $, filename) => postTransforms.hasOwnProperty(manualId)
		? postTransforms[manualId]($, filename)
		: null;
