const bad = [
	"twitter.com",
	"twitter.com/explore",
	"twitter.com/hashtag",
	"twitter.com/home",
	"twitter.com/i",
	"twitter.com/intent",
	"twitter.com/messages",
	"twitter.com/notifications",
	"twitter.com/search",
	"twitter.com/settings",
	"twitter.com/share",
	"twitter.com/threader_app",
	"twitter.com/threadreaderapp",
	"twitter.com/who_to_follow",
	"help.twitter.com/rules-and-policies",
	"twitter.com/privacy",
	"support.twitter.com/articles",
	"help.twitter.com/resources",
	"business.twitter.com/en",
	"twitter.com/i",
	"twitter.com/tos",
	"twitter.com/login"
];

let port;
let nodes = {};

async function process_link(node) {
  const url = new URL(node.href);

	if(bad.indexOf(url.host + "/" + url.pathname.split("/")[1]) != -1) {
		return;
	}

	const handle = url.pathname.split("/")[1];
	if(!nodes[handle]) {
		nodes[handle] = { state: "unknown", nodes: []};
	}
	nodes[handle].nodes.push(node);

	if(nodes[handle].state == "nft-supporter") {
		mark_node(node);
		return;
	}

	port.postMessage({
		type: "check_handle",
		handle: handle
	});
}

function mark_supporter(handle) {
	nodes[handle].state = "nft-supporter";

	for(let node of nodes[handle].nodes) {
		mark_node(node);
	}
}

function mark_node(node) {
	node.classList.add("lens-nft-supporter");
	node.classList.add("lens-has-assigned-label");
}

function updateClasses() {
	for(const [key, node] of Object.entries(nodes)) {
		if(node.state == "nft-supporter") {
			node.nodes.forEach(n => {
				if(!n.classList.contains("lens-nft-supporter")) mark_node(n);
			});
		}
	};
}

function init() {
	// connect to background script
	port = chrome.runtime.connect({name: "checker"});
	port.onDisconnect.addListener(() => {
		port = chrome.runtime.connect({name: "checker"});
	});
	port.onMessage.addListener(async message => {
		const handle = message.handle;
	
		if(message.type == "nft_supporter") {
			mark_supporter(handle);
		}
	});

	// Setup observer
	let observer = new MutationObserver((mutations) => {
		mutations.forEach(mutation => {
			if(mutation.type == "childList") {
				mutation.addedNodes.forEach(node => {
					if(node instanceof HTMLAnchorElement) {
						process_link(node);
					}

					if(node instanceof HTMLElement) {
						node.querySelectorAll("a").forEach(node => {
							process_link(node);
						});
					}
				});
			}
		});
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});

	setInterval(updateClasses, 500);
}

init();