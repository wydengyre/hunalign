import { xml2js } from "xml2js";
import { z } from "zod";
import * as base64 from "std/encoding/base64.ts";
import * as path from "std/path/mod.ts";
import dictionaryListJson from "./dictionaries.json" assert { type: "json" };
import { pooledMap } from "std/async/pool.ts";
import { fromFileUrl } from "std/path/mod.ts";

// written because apertium-dixtools explodes on my machine
// it looks like on JRE 9+ it will throw an IllegalAccessError
// Requiring a Java 7 JRE as a dependency feels nasty.

const DICT_DIR_PATH_REL = "../dist/dictionaries";

const TEMP_PATH_REL = "../temp";

export const conf = {
  dictionaryDir: fromFileUrl(import.meta.resolve(DICT_DIR_PATH_REL)),
  digestAlgo: "sha-256",
  downloadDir: fromFileUrl(import.meta.resolve(TEMP_PATH_REL)),
  // we want to avoid accidentally abusing the server
  maxSimultaneousRequests: 3,
} as const;

async function main() {
  const languages = [
    z.literal("english"),
    z.literal("french"),
    z.literal("italian"),
    z.literal("spanish"),
  ] as const;
  const languageSchema = z.union(languages);
  const dictionaryListJsonSchema = z.array(
    z.tuple([languageSchema, languageSchema, z.string().url(), z.string()]),
  );
  type DictionaryList = z.infer<typeof dictionaryListJsonSchema>;
  const dictionaryList: DictionaryList = await dictionaryListJsonSchema
    .parseAsync(dictionaryListJson);

  const dictionaryMap: Map<string, { url: URL; digest: string }> = new Map(
    dictionaryList.map((
      [lang1, lang2, url, digest],
    ) => [JSON.stringify([lang1, lang2]), { url: new URL(url), digest }]),
  );

  const dictionariesIter: AsyncIterableIterator<[string, ArrayBuffer]> =
    pooledMap(
      conf.maxSimultaneousRequests,
      dictionaryMap.entries(),
      downloadDictionary,
    );

  const failedMatches: Map<string, [string, string]> = new Map();
  const dictionaries: Map<string, string> = new Map();
  const td = new TextDecoder();
  for await (const [langs, data] of dictionariesIter) {
    const digest = await crypto.subtle.digest(conf.digestAlgo, data);
    const digestB64 = base64.encode(digest);

    const expectedDigest = dictionaryMap.get(langs)!.digest;
    if (digestB64 !== expectedDigest) {
      failedMatches.set(langs, [digestB64, expectedDigest]);
    } else {
      dictionaries.set(langs, td.decode(data));
    }
  }

  // consider an option to only warn, rather than fail, here
  if (failedMatches.size > 0) {
    const failures = Array.from(failedMatches.entries())
      .map(([[lang1, lang2], [digest, expectedDigest]]) =>
        `${lang1}-${lang2}: ${digest}, ${expectedDigest}`
      )
      .join("\n");

    throw `unmatched digests:\n${failures}`;
  }

  for (const [langs, data] of dictionaries.entries()) {
    const [lang1, lang2] = JSON.parse(langs);
    const outFilename1 = `${lang1}-${lang2}.dic`;
    const outFilename2 = `${lang2}-${lang1}.dic`;
    const outPath1 = path.join(conf.dictionaryDir, outFilename1);
    const outPath2 = path.join(conf.dictionaryDir, outFilename2);

    const [out1, out2] = process(data);
    console.log(`writing dictionaries to ${outPath1} and ${outPath2}`);
    await Promise.all([
      Deno.writeTextFile(outPath1, out1),
      Deno.writeTextFile(outPath2, out2),
    ]);
  }
}

async function downloadDictionary(
  [langs, { url }]: [string, { url: URL }],
): Promise<[string, ArrayBuffer]> {
  console.log(`Downloading dictionary for ${langs}: ${url.toString()}`);
  const fetched = await fetch(url);
  const data = await fetched.arrayBuffer();

  const urlPath = url.pathname.split("/");
  const filename = urlPath[urlPath.length - 1];
  const savePath = path.join(conf.downloadDir, filename);
  console.log(`Saving dictionary to ${savePath}`);
  await Deno.writeFile(savePath, new Uint8Array(data));
  return [langs, data];
}

const sectionObjSchema = z.object({
  e: z.object({
    p: z.object({
      // the objects that end up here are confusing.
      l: z.string().or(z.object({})).nullable(),
      r: z.string().or(z.object({})).nullable(),
    }).or(z.array(z.unknown())).optional(),
    // looks like instead of p there can be i
  }).array(),
});

const apertiumSchema = z.object({
  dictionary: z.object({
    section: sectionObjSchema.or(z.array(sectionObjSchema)),
  }),
});

// currently very naïve. we could handle inflection
// https://wiki.apertium.org/wiki/Monodix_basics
function process(dict: string): [string, string] {
  const dictXml = xml2js(dict, { compact: true });
  const parsed = apertiumSchema.parse(dictXml);
  const section = parsed.dictionary.section;
  const es = Array.isArray(section) ? section.flatMap(({ e }) => e) : section.e;

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
