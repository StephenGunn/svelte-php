// Store to trigger reload of bookmark tracking displays when a bookmark is clicked
let reloadSignal = $state(0);

export const bookmarkTrackingStore = {
	get signal() {
		return reloadSignal;
	},
	invalidate() {
		reloadSignal++;
	}
};
