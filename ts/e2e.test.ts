import { test } from "node:test";
import { create as createHunalign } from "../dist/index.js";
import { mkTestHunalign } from "./test/node.test.js";

const testHunalign = mkTestHunalign(createHunalign);
test(testHunalign);
