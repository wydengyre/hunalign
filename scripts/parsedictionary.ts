import { process } from "./createdictionary.ts";

function main() {
  const dictPath = Deno.args[0];
  go(dictPath);
}

function go(dictPath: string) {
  const dictText = Deno.readTextFileSync(dictPath);
  const dicts = process(dictText);
  console.log(dicts);
}

if (import.meta.main) {
  await main();
}
