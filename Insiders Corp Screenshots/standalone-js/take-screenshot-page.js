const e = {
	tabId: function(l, i) {
		let s = function(l, i) {
			i || (i = window.location.href), l = l.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			let s = RegExp("[\\?&]" + l + "=([^&#]*)").exec(i);
			return null == s ? null : ("" + decodeURIComponent(s[1])).trim()
		}(l, void 0);
		return null != s && s.length ? parseInt(s) : null
	}("tabId")
};
let t = !1;
async function n(l, i, s) {
	return new Promise((d, u) => {
		if (s && Array.isArray(s.arguments))
			for (let g of s.arguments) a(g);
		chrome.debugger.sendCommand(l, i, null == s ? void 0 : s, l => {
			let i = chrome.runtime.lastError;
			if (i) {
				let s;
				try {
					s = JSON.parse(i.message)
				} catch (g) {
					s = i
				}
				s && null != s.message || (s = i), u(Error(s.message || "unknown debugging interface error"))
			} else d(l)
		})
	})
}

function o() {
	return document.createElement("br")
}

function r() {
	let l = document.createElement("span");
	return l.textContent = " | ", l
}

function a(l) {
	if (null != l.unserializableValue || null != l.objectId) return;
	let i = l.value;
	if (null === i) delete l.value, l.unserializableValue = "null";
	else if ("bigint" == typeof i) delete l.value, l.unserializableValue = i.toString() + "n";
	else if (Object.is(i, -0)) delete l.value, l.unserializableValue = "-0";
	else if (Object.is(i, 1 / 0)) delete l.value, l.unserializableValue = "Infinity";
	else if (Object.is(i, -1 / 0)) delete l.value, l.unserializableValue = "-Infinity";
	else if (Object.is(i, NaN)) delete l.value, l.unserializableValue = "NaN";
	else if (i && "object" == typeof i && i._context && i._remoteObject) {
		let s = i;
		if (s._disposed) throw Error("JSHandle is disposed, can't convert debugger CallArgument!");
		delete l.value, s._remoteObject.unserializableValue ? l.unserializableValue = s._remoteObject.unserializableValue : s._remoteObject.objectId ? l.objectId = s._remoteObject.objectId : l.value = s._remoteObject.value
	}
}
async function c(l, i) {
	if (!l) throw Error("no url received for download");
	let s = {
			url: l,
			filename: i || void 0,
			saveAs: !1,
			conflictAction: "uniquify"
		},
		d = await new Promise((l, i) => {
			chrome.downloads.download(s, s => {
				let d = chrome.runtime.lastError;
				d ? i(Error(d.message)) : l(s)
			})
		});
	return new Promise(l => {
		let i = !1,
			s = function({
				id: u,
				state: g
			}) {
				!i && u === d && g && "in_progress" !== g.current && (chrome.downloads.onChanged.removeListener(s), l("complete" === g.current), i = !0)
			};
		chrome.downloads.onChanged.addListener(s), chrome.downloads.search({
			id: d
		}, d => {
			if (!i && d && d.length) {
				let u = d[0];
				u.state && "in_progress" !== u.state && (chrome.downloads.onChanged.removeListener(s), l("complete" === u.state), i = !0)
			}
		})
	})
}(async () => {
	var l, i;
	try {
		await (i = e, new Promise((l, s) => {
			chrome.debugger.attach(i, "1.3", () => {
				let d = chrome.runtime.lastError;
				d ? s(Error(`failed to attach debugger to tab with id ${i.tabId}, reason: ${d.message}`)) : l()
			})
		})), t = !0, await n(e, "Page.bringToFront");
		let s = await n(e, "Page.getLayoutMetrics"),
			d = Math.min(16384, s.cssContentSize.height),
			u = {
				x: 0,
				y: 0,
				width: Math.floor(s.cssContentSize.width),
				height: Math.floor(d),
				scale: 1
			};
		await n(e, "Emulation.setDeviceMetricsOverride", {
			mobile: !1,
			width: u.width,
			height: u.height,
			deviceScaleFactor: 0
		}), await (l = 300, new Promise(i => setTimeout(i, l)));
		let g = n(e, "Page.captureScreenshot", {
			format: "png",
			quality: 100,
			fromSurface: !0,
			captureBeyondViewport: !0,
			clip: u
		});
		await n(e, "Page.bringToFront");
		let m = await g;
		await n(e, "Emulation.clearDeviceMetricsOverride");
		try {
			chrome.debugger.detach(e), t = !1
		} catch (f) {}
		await async function() {
			return async function(l) {
				let i = await async function(l, i) {
					return new Promise((s, d) => {
						chrome.tabs.update(l, i, l => {
							let i = chrome.runtime.lastError;
							i ? d(Error(i.message)) : s(l)
						})
					})
				}(l, {
					active: !0
				}), s = await async function(l) {
					return new Promise((i, s) => {
						try {
							chrome.windows.get(l, l => {
								let d = chrome.runtime.lastError;
								d ? s(Error(d.message)) : i(l)
							})
						} catch (d) {
							s(d)
						}
					})
				}(i.windowId);
				await async function(l, i) {
					return new Promise((s, d) => {
						chrome.windows.update(l, i, l => {
							let i = chrome.runtime.lastError;
							i ? d(Error(i.message)) : s(l)
						})
					})
				}(i.windowId, {
					focused: !0,
					state: "minimized" === s.state ? "normal" : void 0
				})
			}((await chrome.tabs.getCurrent()).id)
		}(), await async function(l, i) {
			return new Promise((s, d) => {
				let u = new Image;
				u.id = "finished-screenshot", u.src = "data:image/png;base64," + l, u.onload = async () => {
					try {
						document.getElementById("waiting-info-container").remove();
						let l = document.createElement("canvas");
						l.width = u.naturalWidth, l.height = u.naturalHeight;
						let g = l.getContext("2d");
						if (!g) throw Error("Could not get 2d context for base64 screenshot.");
						g.imageSmoothingEnabled = !1, g.drawImage(u, 0, 0), document.body.prepend(u), await async function(l, i) {
							return new Promise((s, d) => {
								let u = document.createElement("a");
								u.text = "Save to disk", u.download = i;
								let g = document.createElement("a");
								g.text = "Close this tab", g.href = "#", g.onclick = l => (l.preventDefault(), window.close(), !1);
								let m = document.createElement("a");
								m.text = "Rate Scrollshot in Google Chrome Store", m.href = "https://chrome.google.com/webstore/detail/scrollshot-scrolling-scre/hpibfnhnogcgalnademehbgcpllmgdil/reviews", m.target = "_blank";
								let f = document.createElement("a");
								f.text = "Rate Scrollshot in Microsoft Edge Store", f.href = "https://microsoftedge.microsoft.com/addons/detail/scrollshot-scrolling-sc/kffnbgjoggjmnnjgcpgjmnghaefeknfm", f.target = "_blank";
								let p = document.createElement("h3");
								p.textContent = "Your Screenshot is ready.";
								let b = document.createElement("span");
								b.textContent = " (should happen automatically)";
								let h = document.createElement("span");
								h.id = "auto-closing-info", h.textContent = "";
								let w = document.createElement("h3");
								w.textContent = "Preview:";
								let y = document.createElement("span");
								y.textContent = "Please leave a positive rating: ";
								let v = document.createElement("h3");
								v.textContent = "Happy?", l.toBlob(async l => {
									if (null === l) d("failed to generate image file");
									else try {
										let $ = URL.createObjectURL(l);
										u.href = $, document.body.prepend(w), document.body.prepend(o()), document.body.prepend(o()), document.body.prepend(o()), document.body.prepend(f), document.body.prepend(r()), document.body.prepend(m), document.body.prepend(y), document.body.prepend(v), document.body.prepend(o()), document.body.prepend(h), document.body.prepend(g), document.body.prepend(r()), document.body.prepend(b), document.body.prepend(u), document.body.prepend(p), await c($, i);
										let E = Date.now() + 12e4,
											C = setInterval(() => {
												let l = Date.now();
												E < l ? (h.textContent = " (auto-closing in 0 seconds)", window.clearInterval(C), window.close()) : h.textContent = ` (auto-closing in ${Math.round((E-l)/1e3)} seconds)`
											}, 1e3);
										s()
									} catch (x) {
										d("failed to save image")
									}
								})
							})
						}(l, i), s()
					} catch (m) {
						d(m)
					}
				}
			})
		}(m.data, `scrollshot-${(new Date).toISOString().replaceAll(":","-").replaceAll(".","-")}.png`)
	} catch (p) {
		try {
			console.error("" + p), await new Promise(l => {
				chrome.notifications.create(void 0, {
					type: "basic",
					iconUrl: chrome.runtime.getURL("img/warning.png"),
					title: "Scrollshot Error",
					message: "Sorry, that didnt work: " + (p.message || p),
					priority: 2
				}, i => {
					let s = chrome.runtime.lastError;
					s && console.error("failed to create notification: " + s.message), l()
				})
			})
		} finally {
			try {
				t && chrome.debugger.detach(e)
			} finally {
				window.close()
			}
		}
	}
})();

