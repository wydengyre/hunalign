import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { create as createHunalign } from "@bitextual/hunalign";
import expected from "./expected.json" with { type: "json" };

test("node hunalign", async () => {
	const __filename = fileURLToPath(import.meta.url);
	const root = dirname(dirname(dirname(__filename)));
	const sourcePath = resolve(root, "examples/demo.en.stem");
	const targetPath = resolve(root, "examples/demo.hu.stem");
	const dictPath = resolve(root, "data/hu-en.dic");
	const [source, target, dict, hunalign] = await Promise.all([
		readFile(sourcePath),
		readFile(targetPath),
		readFile(dictPath),
		createHunalign(),
	]);
	const ladder = hunalign.run(dict, source, target);
	assert.deepStrictEqual(ladder, expected);
});
