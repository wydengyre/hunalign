import { create as createHunalign } from "/hunalign.js";

const [source, target, dict, hunalign] = await Promise.all([
	loadFile("demo.en.stem"),
	loadFile("demo.hu.stem"),
	loadFile("hu-en.dic"),
	createHunalign(),
]);

const ladder = hunalign.run(dict, source, target);
const ladderStr = JSON.stringify(ladder);

const ladderDiv = document.createElement("div");
ladderDiv.id = "ladder";
const ladderTextNode = document.createTextNode(ladderStr);
ladderDiv.appendChild(ladderTextNode);
document.body.appendChild(ladderDiv);
async function loadFile(url) {
	const f = await fetch(url);
	const ar = await f.arrayBuffer();
	return new Uint8Array(ar);
}
