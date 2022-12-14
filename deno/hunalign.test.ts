import { fromFileUrl } from "std/path/mod.ts";
import { DenoHunalign } from "./hunalign.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { Ladder } from "../ts/hunalign.ts";

const WASM_PATH = fromFileUrl(import.meta.resolve("../build/hunalign.wasm"));
const DICT_PATH = fromFileUrl(
  import.meta.resolve("../test/hunapertium-eng-fra.dic"),
);
const FRENCH_PATH = fromFileUrl(
  import.meta.resolve("../test/chapitre.sentences.txt"),
);
const ENGLISH_PATH = fromFileUrl(
  import.meta.resolve("../test/chapter.sentences.txt"),
);
const LADDER_PATH = fromFileUrl(import.meta.resolve("../test/ladder.json"));

Deno.test("produces ladder with paths", async () => {
  const hunalign = await DenoHunalign.createWithWasmPath(WASM_PATH);
  const ladder = await hunalign.runWithPaths(
    DICT_PATH,
    FRENCH_PATH,
    ENGLISH_PATH,
  );
  assertEquals(ladder, await getExpectedLadder());
});

Deno.test("produces latter with data", async () => {
  const [wasmBinary, dict, french, english] = await Promise.all([
    WASM_PATH,
    DICT_PATH,
    FRENCH_PATH,
    ENGLISH_PATH,
  ].map((path) => Deno.readFile(path)));
  const hunalign = await DenoHunalign.createWithWasmBinary(wasmBinary);
  const ladder = hunalign.run(dict, french, english);
  assertEquals(ladder, await getExpectedLadder());
});

let expectedLadder: Ladder | null = null;
async function getExpectedLadder(): Promise<Ladder> {
  if (expectedLadder !== null) {
    return expectedLadder;
  }
  expectedLadder = JSON.parse(await Deno.readTextFile(LADDER_PATH));
  return expectedLadder!;
}
