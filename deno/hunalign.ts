import { Hunalign } from "../ts/hunalign.ts";
import { fromFileUrl } from "https://deno.land/std@0.167.0/path/mod.ts";

const wasmPath = "../web/gen/hunalign.wasm";
const dictPath = "../web/test/hunapertium-eng-fra.dic";
const frenchPath = "../web/test/chapitre.sentences.txt";
const englishPath = "../web/test/chapter.sentences.txt";

const [wasmBinary, dict, french, english] = await Promise.all(
  [wasmPath, dictPath, frenchPath, englishPath]
    .map((path) => Deno.readFile(fromFileUrl(import.meta.resolve(path)))),
);

const hunalign = await Hunalign.create(wasmBinary);
console.log(hunalign.run(dict, french, english));
