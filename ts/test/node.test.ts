import { strict as assert } from "assert";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Hunalign } from "../hunalign.js";
import expected from "./expected.json" with { type: "json" };

export function mkTestHunalign(createHunalign: () => Promise<Hunalign>) {
	return async function testHunalign() {
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
	};
}
