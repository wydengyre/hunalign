import { fromFileUrl } from "std/path/mod.ts";
import { Ladder } from "../ts/hunalign.ts";
import { assertEquals } from "std/testing/asserts.ts";

const DICT_PATH = fromFileUrl(
  import.meta.resolve("../dist/dictionaries/english-french.dic"),
);
const FRENCH_PATH = fromFileUrl(
  import.meta.resolve("../test/chapitre.sentences.txt"),
);
const ENGLISH_PATH = fromFileUrl(
  import.meta.resolve("../test/chapter.sentences.txt"),
);
const LADDER_PATH = fromFileUrl(
  import.meta.resolve("../test/ladder.json"),
);

type TypeOfClassDenoHunalign = {
  createWithWasmBinary: (
    wasmBinary: Uint8Array,
  ) => Promise<TypeOfInstanceDenoHunalign>;
  createWithWasmPath: (wasmPath: string) => Promise<TypeOfInstanceDenoHunalign>;
};
type TypeOfInstanceDenoHunalign = {
  run: (
    dictionary: Uint8Array,
    source: Uint8Array,
    target: Uint8Array,
  ) => Ladder;
  runWithPaths: (
    dictPath: string,
    sourcePath: string,
    targetPath: string,
  ) => Promise<Ladder>;
};

export function testsForResources(
  ClassDenoHunalign: TypeOfClassDenoHunalign,
  wasmPath: string,
) {
  Deno.test("produces ladder with paths", async () => {
    const hunalign = await ClassDenoHunalign.createWithWasmPath(wasmPath);
    const ladder = await hunalign.runWithPaths(
      DICT_PATH,
      FRENCH_PATH,
      ENGLISH_PATH,
    );
    assertEquals(ladder, await getExpectedLadder());
  });

  Deno.test("produces ladder with data", async () => {
    const [wasmBinary, dict, french, english] = await Promise.all([
      wasmPath,
      DICT_PATH,
      FRENCH_PATH,
      ENGLISH_PATH,
    ].map((path) => Deno.readFile(path)));
    const hunalign = await ClassDenoHunalign.createWithWasmBinary(wasmBinary);
    const ladder = hunalign.run(dict, french, english);
    assertEquals(ladder, await getExpectedLadder());
  });
}

let expectedLadder: Ladder | null = null;
async function getExpectedLadder(): Promise<Ladder> {
  if (expectedLadder !== null) {
    return expectedLadder;
  }
  expectedLadder = JSON.parse(await Deno.readTextFile(LADDER_PATH));
  return expectedLadder!;
}
