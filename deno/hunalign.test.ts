import { DenoHunalign } from "./hunalign.ts";
import { testsForResources } from "./test-common.ts";
import { fromFileUrl } from "std/path/mod.ts";

const WASM_PATH = fromFileUrl(import.meta.resolve("../build/hunalign.wasm"));
testsForResources(DenoHunalign, WASM_PATH);
