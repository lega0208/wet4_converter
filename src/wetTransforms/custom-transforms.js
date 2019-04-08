import TOM4031 from './tom-transforms/tom4031';
import TOM1940 from './tom-transforms/tom1940';

// object that maps tom names to their specified transform functions
const tomTransforms = {
	TOM1940,
	TOM4031,
};

export const doTOMTransforms = (manualId, $, filename) =>
	tomTransforms.hasOwnProperty(manualId) ? tomTransforms[manualId]($, filename) : null;