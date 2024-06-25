function uuid() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function(e) {
		let t = Number.parseInt(e, 10);
		return (t ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> t / 4).toString(16)
	})
}
async function createChromeTab(e) {
	return new Promise((t, n) => {
		try {
			chrome.tabs.create(e, e => {
				let a = chrome.runtime.lastError;
				a ? n(Error(a.message)) : t(e)
			})
		} catch (a) {
			n(a)
		}
	})
}
async function getChromeWindow(e) {
	return new Promise((t, n) => {
		try {
			chrome.windows.get(e, e => {
				let a = chrome.runtime.lastError;
				a ? n(Error(a.message)) : t(e)
			})
		} catch (a) {
			n(a)
		}
	})
}
async function createTakeScreenshotTab(e) {
	let t = e.id,
		n, a;
	if (null != t) try {
		let r = await getChromeWindow(e.windowId);
		"normal" === r.type && (n = e.index, a = e.windowId)
	} catch (i) {}
	return createChromeTab({
		active: !1,
		url: `${chrome.runtime.getURL("take-screenshot.html")}?tabId=${t}`,
		index: n,
		windowId: a
	})
}
chrome.runtime.onInstalled.addListener(e => {
	e.reason === chrome.runtime.OnInstalledReason.INSTALL && (chrome.storage.local.set({
		installDate: new Date
	}), chrome.storage.sync.get(["guid"], function(e) {
		e.guid || chrome.storage.sync.set({
			guid: uuid()
		})
	}))
}), chrome.action.onClicked.addListener(async function(e) {
	await createTakeScreenshotTab(e)
}), chrome.commands.onCommand.addListener(async e => {
	if ("command-1" === e) {
		let [t] = await chrome.tabs.query({
			active: !0,
			currentWindow: !0
		});
		await createTakeScreenshotTab(t)
	}
});