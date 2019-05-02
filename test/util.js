import applyWetTransforms from '../src/wetTransforms';
import { basename } from 'path';
import { formatHtml } from '../src/util';
import {
	buildBreadcrumbs,
	buildNav,
	buildSecMenu,
	buildToc,
	buildTOMTitleLink,
} from '../src/build-components';

export function convertData(fileData, filePath) {
	const { isHomepage, manualId, language } = fileData.metadata;

	const content = applyWetTransforms(fileData.content, basename(filePath), isHomepage, manualId);
	const toc = buildToc(fileData.toc, language);
	const tomTitleLink = buildTOMTitleLink(fileData.breadcrumbs);
	const nav = buildNav(fileData.nav, language, fileData.tomNumber);
	const secMenu = buildSecMenu(fileData.secMenu, language, tomTitleLink, isHomepage);
	const breadcrumbs = buildBreadcrumbs(fileData.breadcrumbs, fileData.pageTitle, isHomepage);

	return {
		...fileData,
		content: formatHtml(content),
		toc,
		nav,
		secMenu,
		breadcrumbs,
	}
}

export function chunk(arr = [], opts = { size: 0, numChunks: 0 }) {
	if (arr.length < 2) return arr;

	const chunkedArray = [];

	const chunkSize = opts.numChunks > 0
		? Math.floor(arr.length / opts.numChunks) + 1
		: opts.size || 2;

	while (arr.length > 0) {
		chunkedArray.push(arr.splice(0, chunkSize));
	}

	return chunkedArray;
}