import {
  testLadderWithData,
  testLadderWithPaths,
  TypeOfClassDenoHunalign,
} from "./test-common.ts";
import {fromFileUrl} from "std/path/mod.ts";

const WASM_PATH = fromFileUrl(import.meta.resolve("../build/hunalign.wasm"));

Deno.test("produces ladder with paths", async () => {
  const DenoHunalign = await importUnbundledDenoHunalign();
  await testLadderWithPaths(DenoHunalign, WASM_PATH);
});

Deno.test("produces ladder with data", async () => {
  const DenoHunalign = await importUnbundledDenoHunalign();
  await testLadderWithData(DenoHunalign, WASM_PATH);
});

async function importUnbundledDenoHunalign(): Promise<TypeOfClassDenoHunalign> {
  const { DenoHunalign } = await import("./hunalign.ts");
  return DenoHunalign;
}
