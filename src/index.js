import { BloomFilter } from "./bloom";

if (typeof browser === "undefined") {
	var browser = chrome;
}

let filter;
async function loadFilter() {
	const url = chrome.runtime.getURL("data/nft-user.dat");
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const array = new Uint32Array(arrayBuffer);
	const b = new BloomFilter(array, 20);
	b.name = "nft-user";

	filter = b;
	chrome.bfilt = b;
	console.log("Filter loaded...");
}

chrome.runtime.onConnect.addListener(port => {
	console.log("Received connection from tab content script...");

	if(!filter) {
		loadFilter().then(() => {
			console.debug("Bloom filter loaded...");
		});
	}

	port.onMessage.addListener(async message => {
		if(!filter) await loadFilter();

		if(message.type == "check_handle") {
			console.debug("Checking handle: %s\nResult: %s", message.handle, filter.test(message.handle));

			if(filter && filter.test(message.handle)) {
				port.postMessage({
					type: "nft_supporter",
					handle: message.handle
				});
			}
		}
	});
});

/* CONTEXT MENU */

const report_context = chrome.contextMenus.create({
	id: "LENS_CONTEXT_ADD",
	title: "Add %s to NFT supporter list",
	contexts: ["link"],
	targetUrlPatterns: ["*://*.twitter.com/*"]
});

function report(info, tab) {
	if(info.menuItemId != "LENS_CONTEXT_ADD") return;

	chrome.tabs.create({
		url: "https://lens.skyeto.com/report?url=" + encodeURIComponent(info.linkUrl)
	});
}
chrome.contextMenus.onClicked.addListener(report);