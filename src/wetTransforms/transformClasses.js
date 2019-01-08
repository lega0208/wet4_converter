
export default function transformClasses($) {
	// maps wet2 classes to wet4 equivalents
	const classMap = {
		// Style classes
		'align-right': 'text-right',
		'align-center': 'text-center',
		'align-left': 'text-left',
		//'background-light': '',
		//'background-dark': '',
		'background-accent': 'bg-primary',
		'clear': 'clearfix',
		'equalize': 'wb-eqht',
		'float-right': 'pull-right',
		'float-left': 'pull-left',
		'color-accent': 'text-primary',
		'color-attention': 'text-danger',
		'font-xsmall': 'small',
		'font-small': 'small',
		'font-medium': '',
		'font-large': 'lead',
		'font-xlarge': 'lead',
		'indent-none': 'mrgn-lft-0',
		'indent-small': 'mrgn-lft-sm',
		'indent-medium': 'mrgn-lft-md',
		'indent-large': 'mrgn-lft-lg',
		'indent-xlarge': 'mrgn-lft-xl',
		'margin-bottom-none': 'mrgn-bttm-0',
		'margin-bottom-small': 'mrgn-bttm-sm',
		'margin-bottom-medium': 'mrgn-bttm-md',
		'margin-bottom-large': 'mrgn-bttm-lg',
		'margin-bottom-xlarge': 'mrgn-bttm-xl',
		'margin-top-none': 'mrgn-tp-0',
		'margin-top-small': 'mrgn-tp-sm',
		'margin-top-medium': 'mrgn-tp-sm',
		'margin-top-large': 'mrgn-tp-lg',
		'margin-top-xlarge': 'mrgn-tp-xl',
		'margin-right-none': 'mrgn-rght-0',
		'margin-right-small': 'mrgn-rght-sm',
		'margin-right-medium': 'mrgn-rght-sm',
		'margin-right-large': 'mrgn-rght-lg',
		'margin-right-xlarge': 'mrgn-rght-xl',
		'cn-invisible': 'wb-inv',
		'list-bullet-none': 'list-unstyled',
		'list-lower-alpha': 'lst-lwr-alph',
		'list-upper-alpha': 'lst-upr-alph',
		'list-lower-roman': 'lst-lwr-rmn',
		'list-upper-roman': 'lst-upr-rmn',
		'list-numeric': 'lst-num',
		'zebra': 'table-striped',
		'wrap-none': 'nowrap',
		//'table-accent': '',

		// Module classes
		'module-note': 'alert alert-info',
		'module-info': 'alert alert-info',
		'module-tool': 'alert alert-info',
		'module-alert': 'alert alert-warning',
		'module-attention': 'alert alert-danger',


		// Grid classes
		'span-1': 'col-md-2',
		'span-2': 'col-md-4',
		'span-3': 'col-md-6',
		'span-4': 'col-md-8',
		'span-5': 'col-md-10',
		'span-6': 'col-md-12',
	};

	// function to call for each entry in the class map
	const replaceClass = ([className, replacement]) => $(`.${className}`)
			.each((i, elem) => $(elem).addClass(replacement).removeClass(className));

	Object.entries(classMap).forEach(classes => replaceClass(classes));
}