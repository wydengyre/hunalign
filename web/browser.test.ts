import { Hunalign } from "./hunalign/hunalign.js";

const DICT_PATH = "dictionaries/english-french.dic";
const FRENCH_PATH = "test/chapitre.sentences.txt";
const ENGLISH_PATH = "test/chapter.sentences.txt";
const LADDER_PATH = "test/ladder.json";

const hun = await Hunalign.create();
const [dict, french, english, ladder] = await Promise.all(
  [DICT_PATH, FRENCH_PATH, ENGLISH_PATH, LADDER_PATH].map(path => loadFile(path))
);

async function loadFile(url: string): Promise<Uint8Array> {
  const f = await fetch(url);
  const ar = await f.arrayBuffer();
  return new Uint8Array(ar);
}
