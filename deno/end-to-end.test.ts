import {
  testLadderWithData,
  testLadderWithPaths,
  TypeOfClassDenoHunalign,
} from "./test-common.ts";
import {fromFileUrl} from "std/path/mod.ts";

const WASM_PATH = fromFileUrl(import.meta.resolve("../dist/deno/hunalign.wasm"));

Deno.test("produces ladder with paths", async () => {
  const DenoHunalign = await importBundledDenoHunalign();
  await testLadderWithPaths(DenoHunalign, WASM_PATH);
});

Deno.test("produces ladder with data", async () => {
  const DenoHunalign = await importBundledDenoHunalign();
  await testLadderWithData(DenoHunalign, WASM_PATH);
});

async function importBundledDenoHunalign(): Promise<TypeOfClassDenoHunalign> {
  const { DenoHunalign } = await import("../dist/deno/hunalign.js");
  return DenoHunalign as TypeOfClassDenoHunalign;
}
