import * as xml from "xml";
import { z } from "zod";
import * as base64 from "std/encoding/base64.ts";
import { basename, fromFileUrl, join } from "std/path/mod.ts";
import dictionaryListJson from "./dictionaries.json" assert { type: "json" };
import { pooledMap } from "std/async/pool.ts";

// written because apertium-dixtools explodes on my machine

const DIGEST_ALGO = "sha-256";
const MAX_SIMULTANEOUS_REQUESTS = 3; // hopefully stays under caps

const LANGUAGES = ["english", "french", "italian", "spanish"] as const;
type Language = typeof LANGUAGES[number];
type LanguagePair = [Language, Language];

async function main() {
  const languageSchema = z.union(LANGUAGES.map((l) => z.literal(l)));
  const dictionaryListJsonSchema = z.array(
    z.tuple([languageSchema, languageSchema, z.string().url(), z.string()]),
  );
  type DictionaryList = z.infer<typeof dictionaryListJsonSchema>;
  const dictionaryList: DictionaryList = await dictionaryListJsonSchema
    .parseAsync(dictionaryListJson);

  const dictionaryMap: Map<LanguagePair, {url: URL, digest: string}> = new Map(dictionaryList.map(([lang1, lang2, url, digest]) =>
    [[lang1, lang2], {url: new URL(url), digest}]
  ));

  const dictionariesIter: AsyncIterableIterator<[LanguagePair, ArrayBuffer]> =
    pooledMap(MAX_SIMULTANEOUS_REQUESTS, dictionaryMap.entries(), downloadDictionary);

  const failedMatches: Map<LanguagePair, [string, string]> = new Map();
  for await (const [langs, data] of dictionariesIter) {
    const digest = await crypto.subtle.digest(DIGEST_ALGO, data);
    const digestB64 = base64.encode(digest);

    const expectedDigest = dictionaryMap.get(langs)!.digest;
    if (digestB64 !== expectedDigest) {
      failedMatches.set(langs, [digestB64, expectedDigest]);
    }
  }

  if (failedMatches.size > 0) {
    const failures = Array.from(failedMatches.entries())
      .map(([[lang1, lang2], [digest, expectedDigest]]) => `${lang1}-${lang2}: ${digest}, ${expectedDigest}`)
      .join("\n");

    throw `unmatched digests:\n${failures}`;
  }
}

async function downloadDictionary([langs, {url}]: [LanguagePair, {url: string}]): [LanguagePair, ArrayBuffer] {
  const fetched = await fetch(url);
  const data = await fetched.arrayBuffer();
  return [langs, data];
}

const apertiumSchema = z.object({
  dictionary: z.object({
    section: z.object({
      e: z.object({
        p: z.object({
          // the objects that end up here are confusing.
          l: z.string().or(z.object({})).nullable(),
          r: z.string().or(z.object({})).nullable(),
        }).or(z.array(z.unknown())).optional(),
        // looks like instead of p there can be i
      }).array(),
    }),
  }),
});

// async function main() {
//   const args = Deno.args;
//   const resourcesPath = fromFileUrl(import.meta.resolve("../resources"));
//
//   if (args.length !== 1) {
//     console.error("USAGE: provide apertium .dix dictionary path as argument");
//     Deno.exit(1);
//   }
//
//   const inPath = args[0];
//   const infileName = basename(inPath);
//
//   const _EXPECTED_FORMAT = "apertium-lang1-lang2.lang1-lang2.dix";
//   const [lang1, lang2] = infileName.split(".")[1].split("-");
//
//   const outFilename1 = `${lang1}-${lang2}.dic`;
//   const outFilename2 = `${lang2}-${lang1}.dic`;
//
//   const outPath1 = join(resourcesPath, outFilename1);
//   const outPath2 = join(resourcesPath, outFilename2);
//
//   await go(inPath, outPath1, outPath2);
// }

async function go(inPath: string, outPath1: string, outPath2: string) {
  const inStr = await Deno.readTextFile(inPath);
  const [out1, out2] = await process(inStr);
  await Promise.all([
    Deno.writeTextFile(outPath1, out1),
    Deno.writeTextFile(outPath2, out2),
  ]);
}

// currently very naïve. we could handle inflection
// https://wiki.apertium.org/wiki/Monodix_basics
function process(dict: string): [string, string] {
  const dictXml = xml.parse(dict);
  const parsed = apertiumSchema.parse(dictXml);
  const es = parsed.dictionary.section.e;

  // have had to really relax the schema and filter
  const defs: [string, string][] = es
    .filter((e): e is { p: { l: string; r: string } } =>
      e.p !== undefined && !Array.isArray(e.p) && typeof e.p.l === "string" &&
      typeof e.p.r === "string"
    )
    .map((
      { p: { l, r } },
    ) => [normalizeWord(l), normalizeWord(r)]);
  // awfully inefficient and gross
  const uniqueDefs: [string, string][] = [
    ...new Set(defs.map((def) => JSON.stringify(def))),
  ]
    .map((jsonDef) => JSON.parse(jsonDef));
  // TODO: look into locale-based sorting
  uniqueDefs.sort();

  const lToR = uniqueDefs.map(([l, r]) => `${l} @ ${r}`).join("\n");
  const rToL = uniqueDefs.map(([l, r]) => `${r} @ ${l}`).sort().join("\n");
  return [lToR, rToL];
}

// https://stackoverflow.com/a/5002161
const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;
function normalizeWord(word: string): string {
  const SPACE = String.raw`<b/>`;
  return word
    .replaceAll(SPACE, " ")
    .replaceAll(HTML_TAG_RE, "");
}

if (import.meta.main) {
  await main();
}
