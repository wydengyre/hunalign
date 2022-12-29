// useful for dictionaries.json

import * as base64 from "std/encoding/base64.ts";
import { conf } from "./createdictionary.ts";

async function main() {
  const dictPath = Deno.args[0];
  const dict = await Deno.readFile(dictPath);
  const digest = await crypto.subtle.digest(conf.digestAlgo, dict);
  const digestB64 = base64.encode(digest);
  console.log(digestB64);
}

if (import.meta.main) {
  await main();
}
