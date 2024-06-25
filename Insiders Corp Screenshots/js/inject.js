const interval = 100,
	speeds = [0, 1, 10, 30];
let speedIndex = 0;
chrome.runtime.onMessage.addListener((e, s, d) => {
	if (s.id == chrome.runtime.id) switch (e.op) {
		case "ready":
			d(!0);
			break;
		case "toggle":
			d(speeds[speedIndex = (speedIndex + 1) % speeds.length])
	}
}), globalThis.setInterval(() => {
	speedIndex && globalThis.scrollTo(globalThis.scrollX, globalThis.scrollY + speeds[speedIndex])
}, 100);