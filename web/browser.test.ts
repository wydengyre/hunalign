import { Hunalign } from "./hunalign/hunalign.js";

const DICT_PATH = "dictionaries/english-french.dic";
const FRENCH_PATH = "test/chapitre.sentences.txt";
const ENGLISH_PATH = "test/chapter.sentences.txt";

const [dict, french, english] = await Promise.all(
  [DICT_PATH, FRENCH_PATH, ENGLISH_PATH].map((path) => loadFile(path)),
);
const hun = await Hunalign.create();
const ladder = hun.run(dict, french, english);
const ladderStr = JSON.stringify(ladder);

const ladderDiv = document.createElement("div");
ladderDiv.id = "ladder";
const ladderTextNode = document.createTextNode(ladderStr);
ladderDiv.appendChild(ladderTextNode);
document.body.appendChild(ladderDiv);

async function loadFile(url: string): Promise<Uint8Array> {
  const f = await fetch(url);
  const ar = await f.arrayBuffer();
  return new Uint8Array(ar);
}
