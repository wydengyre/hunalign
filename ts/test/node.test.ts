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

	const errOutput: string[] = [];
	const printErr = (str: string) => {
		errOutput.push(str);
	};

	const [source, target, dict, hunalign] = await Promise.all([
		readFile(sourcePath),
		readFile(targetPath),
		readFile(dictPath),
		createHunalign({ printErr }),
	]);
	const ladder = hunalign.run(dict, source, target);
	assert.deepStrictEqual(ladder, expected);
	assert.deepStrictEqual(errOutput, [
		"Reading dictionary...",
		"501 source language sentences read.",
		"529 target language sentences read.",
		"quasiglobal_stopwordRemoval is set to 0",
		"Simplified dictionary ready.",
		"Rough translation ready.",
		"0 ",
		"100 200 300 400 500 ",
		"Rough translation-based similarity matrix ready.",
		"Matrix built.",
		"Trail found.",
		"Align ready.",
		"Global quality of unfiltered align 0.377373",
		"quasiglobal_spaceOutBySentenceLength is set to 1",
		"Trail spaced out by sentence length.",
		"Global quality of unfiltered align after realign 0.377373",
		"Quality 0.377373",
	]);
});
