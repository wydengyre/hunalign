import { fromFileUrl } from "std/path/mod.ts";

const DECLARATION_FILE_PATH = fromFileUrl(
  import.meta.resolve("../dist/deno/hunalign.d.ts"),
);
const TYPES_FILE_PATH = fromFileUrl(import.meta.resolve("../ts/hunalign.ts"));

async function main() {
  const [declarations, types] = await Promise.all([
    Deno.readTextFile(DECLARATION_FILE_PATH),
    Deno.readTextFile(TYPES_FILE_PATH),
  ]);

  // kill first two lines of the declarations file, which are imports
  const LINES_TO_REMOVE = 2;
  const declarationsWithoutImports = declarations
    .split("\n")
    .slice(LINES_TO_REMOVE)
    .join("\n");

  const typeExports = types
    .split("\n")
    .filter((line) => line.startsWith("export type "))
    .join("\n");

  const output = typeExports + "\n" + declarationsWithoutImports;
  await Deno.writeTextFile(DECLARATION_FILE_PATH, output);
}

if (import.meta.main) {
  await main();
}
