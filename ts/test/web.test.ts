import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import * as http from "node:http";
import path, { dirname } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import puppeteer, { Browser } from "puppeteer";
import expected from "./expected.json" with { type: "json" };

before(startServer);
before(startBrowser);
after(stopBrowser);
after(stopServer);
test(webTest);

const hostname = "127.0.0.1";
let server: http.Server | undefined;
async function startServer() {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const root = dirname(dirname(__dirname));

	const htmlPath = path.join(__dirname, "web.html");
	const browserTestJsPath = path.join(__dirname, "web.js");
	const hunalignJsPath = fileURLToPath(
		import.meta.resolve("@bitextual/hunalign"),
	);
	const hunalignWasmPath = fileURLToPath(
		import.meta.resolve("@bitextual/hunalign/hunalign.wasm"),
	);
	const enPath = path.join(root, "examples/demo.en.stem");
	const huPath = path.join(root, "examples/demo.hu.stem");
	const dicPath = path.join(root, "data/hu-en.dic");

	const paths = [
		htmlPath,
		browserTestJsPath,
		hunalignJsPath,
		hunalignWasmPath,
		enPath,
		huPath,
		dicPath,
	];
	const loadPromises = paths.map((path) => readFile(path));
	const [html, browserTestJs, hunalignJs, hunalignWasm, en, hu, dic] =
		(await Promise.all(loadPromises)) as [
			Buffer,
			Buffer,
			Buffer,
			Buffer,
			Buffer,
			Buffer,
			Buffer,
		];

	server = http.createServer((req, res) => {
		switch (req.url) {
			case "/":
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(html);
				break;
			case "/web.js":
				res.writeHead(200, { "Content-Type": "application/javascript" });
				res.end(browserTestJs);
				break;
			case "/hunalign.js":
				res.writeHead(200, { "Content-Type": "application/javascript" });
				res.end(hunalignJs);
				break;
			case "/hunalign.wasm":
				res.writeHead(200, { "Content-Type": "application/wasm" });
				res.end(hunalignWasm);
				break;
			case "/demo.en.stem":
				res.writeHead(200, { "Content-Type": "text/plain" });
				res.end(en);
				break;
			case "/demo.hu.stem":
				res.writeHead(200, { "Content-Type": "text/plain" });
				res.end(hu);
				break;
			case "/hu-en.dic":
				res.writeHead(200, { "Content-Type": "text/plain" });
				res.end(dic);
				break;
			default:
				res.writeHead(404);
				res.end();
				break;
		}
	});
	await new Promise<void>((resolve, reject) => {
		(server as http.Server)
			.listen(0, hostname, () => {
				resolve();
			})
			.on("error", reject);
	});
}

async function stopServer() {
	if (server === undefined) {
		return;
	}
	const close = promisify(server.close.bind(server));
	await close();
}

let browser: Browser | undefined;
async function startBrowser() {
	browser = await puppeteer.launch();
}
async function stopBrowser() {
	if (browser === undefined) {
		return;
	}
	await browser.close();
}

async function webTest() {
	if (server === undefined) {
		throw new Error("Server not yet initialized");
	}
	if (browser === undefined) {
		throw new Error("Browser not yet initialized");
	}
	const addr = server.address();
	if (typeof addr !== "object" || addr === null) {
		throw new Error(`Server address should be object, got ${addr}`);
	}
	const { address, port } = addr;
	const url = `http://${address}:${port}`;
	// uncomment to load this in a browser for local debugging
	// console.log(`testing ${url}`);

	const page = await browser.newPage();
	await page.goto(url);
	const ladderElement = await page.waitForSelector("#ladder");
	const ladderHtmlText = await ladderElement?.evaluate((el) => el.textContent);
	const ladder = JSON.parse(ladderHtmlText as string);
	assert.deepStrictEqual(ladder, expected);
}
