import TOM4031 from './tom-transforms/TOM4031';

// object that maps tom names to their specified transform functions
const tomTransforms = {
	TOM4031,
};

export const doTOMTransforms = (manualId, $, filename) =>
	tomTransforms.hasOwnProperty(manualId) ? tomTransforms[manualId]($, filename) : null;