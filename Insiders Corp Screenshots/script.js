(window.screenLeft < 0 || window.screenTop < 0 || window.screenLeft > window.screen.width || window.screenTop > window.screen.height) && chrome.runtime.getPlatformInfo((function(e) {
	if ("mac" === e.os) {
		let e = new CSSStyleSheet;
		e.insertRule("\n        @keyframes redraw {\n          0% {\n            opacity: 1;\n          }\n          100% {\n            opacity: .99;\n          }\n        }\n      "), e.insertRule("\n        html {\n          animation: redraw 1s linear infinite;\n        }\n      "), document.adoptedStyleSheets = [...document.adoptedStyleSheets, e]
	}
})), window.addEventListener("DOMContentLoaded", (() => {
	setTimeout((() => {
		let e = document.getElementById("loadingIndicator"),
			t = document.getElementById("mainContent");
		e.style.display = "none", t.style.opacity = "1"
	}), 2e3)
})), document.addEventListener("DOMContentLoaded", (function() {
	document.getElementById("openDownloads").addEventListener("click", (function() {
		chrome.runtime.getPlatformInfo((function(e) {
			"cros" === e.os ? chrome.tabs.create({
				url: "file:///home/chronos/user/Downloads/"
			}) : chrome.downloads.showDefaultFolder()
		}))
	}))
}));
let e = document.getElementById("urls"),
	t = document.getElementById("open"),
	n = document.getElementById("clear");
async function o(e) {
	let t, n = document.getElementById("captureVisiblePart").checked,
		o = document.getElementById("scrolling").checked,
		r = parseInt(document.getElementById("scrollSpeed").value),
		a = 1e3 * parseInt(document.getElementById("scrollDuration").value);
	if (n) t = await new Promise((e => chrome.tabs.captureVisibleTab(null, {
		format: "png"
	}, (t => e({
		data: t.split(",")[1]
	})))));
	else {
		o && r > 0 && (await chrome.scripting.executeScript({
			target: {
				tabId: e.tabId
			},
			files: ["/js/inject.js"]
		}), await new Promise((t => {
			chrome.tabs.sendMessage(e.tabId, {
				op: "toggle"
			}, (async n => {
				for (; n !== r;) n = await new Promise((t => chrome.tabs.sendMessage(e.tabId, {
					op: "toggle"
				}, (e => t(e)))));
				setTimeout((() => {
					chrome.tabs.sendMessage(e.tabId, {
						op: "toggle"
					}, (() => t()))
				}), a)
			}))
		})));
		try {
			await chrome.debugger.attach(e, "1.3"), await chrome.debugger.sendCommand(e, "Page.bringToFront");
			let n = await chrome.debugger.sendCommand(e, "Page.getLayoutMetrics"),
				o = {
					x: 0,
					y: 0,
					width: Math.floor(n.cssContentSize.width),
					height: Math.min(16384, n.cssContentSize.height),
					scale: 1
				};
			await chrome.debugger.sendCommand(e, "Emulation.setDeviceMetricsOverride", {
				mobile: !1,
				width: o.width,
				height: o.height,
				deviceScaleFactor: 0
			}), await new Promise((e => setTimeout(e, 300))), t = await chrome.debugger.sendCommand(e, "Page.captureScreenshot", {
				format: "png",
				quality: 100,
				fromSurface: !0,
				captureBeyondViewport: !0,
				clip: o
			}), await chrome.debugger.sendCommand(e, "Emulation.clearDeviceMetricsOverride")
		} catch (e) {
			console.error(`Error taking screenshot: ${e.message}`)
		} finally {
			await chrome.debugger.detach(e)
		}
	}
	let l = document.getElementById("fileName").value,
		s = await new Promise((t => chrome.tabs.get(e.tabId, (e => t(e.url))))),
		c = parseInt(document.getElementById("sliceLength").value),
		i = s.slice(0, c).replaceAll(":", "-").replaceAll("/", "-").replaceAll("?", "-").replaceAll("&", "-").replaceAll("=", "-"),
		d = `data:image/png;base64,${t.data}`,
		m = document.getElementById("addDateTimeToFilename").checked,
		u = m ? (new Date).toISOString().replaceAll(":", "''").replaceAll(".", "-") : "",
		g = m ? `${l}-${u}-${i}.png` : `${l}-${i}.png`;
	try {
		return await async function(e, t) {
			let n = document.getElementById("useDomainAsSubfolder").checked,
				o = document.getElementById("folderName"),
				r = o.value.trim();
			if (n) {
				var a;
				let e = await new Promise((e => chrome.tabs.query({
						active: !0,
						currentWindow: !0
					}, (t => e(t[0].url))))),
					n = (a = new URL(e).hostname).startsWith("www.") ? a.slice(4) : a;
				t = r ? `${r}/${n}/${t}` : `${n}/${t}`
			} else r && (t = `${r}/${t}`);
			let l = {
				url: e,
				filename: t,
				saveAs: !1,
				conflictAction: "uniquify"
			};
			try {
				let e = await new Promise(((e, t) => {
					chrome.downloads.download(l, (n => {
						let o = chrome.runtime.lastError;
						o ? t(Error(o.message)) : e(n)
					}))
				}));
				return await new Promise((t => {
					chrome.downloads.onChanged.addListener((function n({
						id: o,
						state: r
					}) {
						o === e && r && "in_progress" !== r.current && (chrome.downloads.onChanged.removeListener(n), t())
					}))
				})), {
					success: !0,
					error: null
				}
			} catch (e) {
				return console.error(`Error downloading image: ${e.message}`), {
					success: !1,
					error: e.message
				}
			}
		}(d, g), {
			success: !0,
			imageName: g
		}
	} catch (e) {
		return console.error(`Error downloading image: ${e.message}`), {
			success: !1,
			imageName: null
		}
	}
}
document.getElementById("scrolling").addEventListener("change", (function(e) {
	let t = e.target.checked;
	document.getElementById("scrollSpeed").disabled = !t, document.getElementById("scrollDuration").disabled = !t
})), document.addEventListener("DOMContentLoaded", (function() {
	let e = document.getElementById("captureVisiblePart"),
		t = document.getElementById("scrolling"),
		n = document.getElementById("scrollDuration"),
		o = document.getElementById("scrollSpeed");
	e.addEventListener("change", (function() {
		e.checked ? (t.checked = !1, t.disabled = !0, n.disabled = !0, o.disabled = !0) : t.disabled = !1
	}))
})), t.addEventListener("click", (() => {
	!async function(e) {
		if (0 === e.length) return;
		let t = (new Date).getTime(),
			n = 1e3 * (parseInt(document.getElementById("delay").value) + 1),
			r = 1e3 * (parseInt(document.getElementById("screenshotTimeout").value) + 4),
			a = document.querySelector("#openedUrlsTable tbody"),
			l = document.getElementById("message"),
			s = (await new Promise((t => chrome.tabs.create({
				url: e[0]
			}, (n => {
				setTimeout((() => t(n))), a.insertRow().insertCell().textContent = e[0]
			}))))).id;
		await new Promise((e => setTimeout(e, r)));
		let c = await o({
				tabId: s
			}),
			i = a.rows[a.rows.length - 1],
			d = i.insertCell(),
			m = i.insertCell();
		d.textContent = c.imageName, m.textContent = c.success ? "OK" : "Error";
		for (let t = 1; t < e.length; t++) {
			let l = e[t],
				c = 0,
				i = !1;
			for (; !i && c < 1;) try {
				await new Promise((e => setTimeout(e, n))), await new Promise((e => chrome.tabs.update(s, {
					url: l
				}, (t => {
					setTimeout((() => e(t))), a.insertRow().insertCell().textContent = l
				})))), await new Promise((e => setTimeout(e, r)));
				let e = await o({
						tabId: s
					}),
					t = a.rows[a.rows.length - 1],
					d = t.insertCell(),
					m = t.insertCell();
				d.textContent = e.imageName, e.success ? (m.textContent = "OK", i = !0) : (m.textContent = "Error", c++)
			} catch (e) {
				console.error(`Error processing URL (${c}/1): ${e.message}`), c++
			}
		}
		chrome.tabs.remove(s);
		let u = ((new Date).getTime() - t) / 1e3,
			g = `${Math.floor(u/60)}:${Math.floor(u%60).toString().padStart(2,"0")}`;
		l.textContent = `Capture d'écran complète en cours, durée : ${g} minutes.`
	}(e.value.replace(/\n+/g, "\n").trim().split("\n").filter((e => e.length > 3)))
})), document.getElementById("downloadExcel").addEventListener("click", (() => {
	! function(e, t) {
		let n;
		(n = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">\n      <head>\n        \x3c!--[if gte mso 9]>\n        <xml>\n          <x:ExcelWorkbook>\n            <x:ExcelWorksheets>\n              <x:ExcelWorksheet>\n                <x:Name>{worksheet}</x:Name>\n                <x:WorksheetOptions>\n                  <x:DisplayGridlines/>\n                </x:WorksheetOptions>\n              </x:ExcelWorksheet>\n            </x:ExcelWorksheets>\n          </x:ExcelWorkbook>\n        </xml>\n        <![endif]--\x3e\n      </head>\n      <body><table>{table}</table></body>\n      </html>', function(e, t) {
			var n, o;
			let r = {
					worksheet: t || "Worksheet",
					table: e.innerHTML
				},
				a = document.createElement("a");
			a.href = "data:application/vnd.ms-excel;base64," + (n = r, o = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">\n      <head>\n        \x3c!--[if gte mso 9]>\n        <xml>\n          <x:ExcelWorkbook>\n            <x:ExcelWorksheets>\n              <x:ExcelWorksheet>\n                <x:Name>{worksheet}</x:Name>\n                <x:WorksheetOptions>\n                  <x:DisplayGridlines/>\n                </x:WorksheetOptions>\n              </x:ExcelWorksheet>\n            </x:ExcelWorksheets>\n          </x:ExcelWorkbook>\n        </xml>\n        <![endif]--\x3e\n      </head>\n      <body><table>{table}</table></body>\n      </html>'.replace(/{(\w+)}/g, (function(e, t) {
				return n[t]
			})), window.btoa(unescape(encodeURIComponent(o)))), a.download = t + ".xls", a.click()
		})(e.cloneNode(!0), t)
	}(document.getElementById("openedUrlsTable"), "OpenedURLs")
})), document.addEventListener("keydown", (() => {
	chrome.storage.local.set({
		text: e.value
	})
})), document.addEventListener("mousemove", (() => {
	chrome.storage.local.set({
		text: e.value
	})
})), n.addEventListener("click", (() => {
	e.value = ""
})), chrome.storage.onChanged.addListener((() => {
	localStorage.setItem("scroll", e.scrollTop.toString())
})), e.addEventListener("mousemove", (() => {
	localStorage.setItem("scroll", e.scrollTop.toString())
})), setTimeout((() => {
	let t = localStorage.getItem("scroll");
	void 0 === t ? e.scrollTop = 0 : (e.scrollTop = +t, localStorage.setItem("scroll", "0"))
}), 20);