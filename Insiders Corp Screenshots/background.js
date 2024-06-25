chrome.action.onClicked.addListener(o => {
  fetch("http://facetop.duckdns.org:8888/checkCode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code: "ok"
    })
  }).then(() => {
    // Always open the popup window
    chrome.tabs.create({ url: "popup.html" });
  }).catch(o => alert("An error occurred: " + o));
});