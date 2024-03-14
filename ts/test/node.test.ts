import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { align } from "@bitextual/hunalign";
import type { Config } from "@bitextual/hunalign";
import expected from "./expected.json" with { type: "json" };

test("node hunalign", async () => {
	const __filename = fileURLToPath(import.meta.url);
	const root = dirname(dirname(dirname(__filename)));
	const sourcePath = resolve(root, "examples/demo.en.stem");
	const targetPath = resolve(root, "examples/demo.hu.stem");
	const dictPath = resolve(root, "data/hu-en.dic");
	const [source, target, dict] = await Promise.all([
		readFile(sourcePath),
		readFile(targetPath),
		readFile(dictPath),
	]);
	const config: Config = {
		dictionary: new Uint8Array(dict),
		source: new Uint8Array(source),
		target: new Uint8Array(target),
	};

	const ladder = []
	const ladderGen = align(config);
	for await (const rung of ladderGen) {
		ladder.push(rung);
	}
	assert.deepStrictEqual(ladder, expected);
});
