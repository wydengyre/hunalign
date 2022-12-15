import { DenoHunalign } from "../dist/deno/hunalign.js";
import { testsForResources } from "./test-common.ts";
import { fromFileUrl } from "std/path/mod.ts";

const WASM_PATH = fromFileUrl(
  import.meta.resolve("../dist/deno/hunalign.wasm"),
);
testsForResources(DenoHunalign, WASM_PATH);
