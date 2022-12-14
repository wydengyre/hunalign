import mkHunalign from "../web/gen/hunalign.js";
import { fromFileUrl } from "https://deno.land/std@0.167.0/path/mod.ts";

// based on https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/emscripten/index.d.ts
// should consider moving this into the compilation step
type Module = {
  callMain: (args: string[]) => void;
  FS: {
    writeFile: (
      path: string,
      data: string | ArrayBufferView,
      opts?: { flags?: string | undefined },
    ) => void;
  };
};

export class Hunalign {
  #module: Module;
  #printLog: string[];

  private constructor(module: Module, printLog: string[]) {
    this.#module = module;
    this.#printLog = printLog;
  }

  run(
    dictionary: Uint8Array,
    source: Uint8Array,
    target: Uint8Array,
  ): string[] {
    this.#module.FS.writeFile("/dictionary", dictionary);
    this.#module.FS.writeFile("/source", source);
    this.#module.FS.writeFile("/target", target);
    this.#module.callMain(["dictionary", "source", "target"]);
    return this.#printLog;
  }

  static async create(wasmBinary: Uint8Array): Promise<Hunalign> {
    const printLog: string[] = [];
    function print(text: string): void {
      printLog.push(text);
    }

    // TODO: can this be made sync? Docs mention a trick.
    const module = await mkHunalign({ print, wasmBinary });
    return new Hunalign(module, printLog);
  }
}

const wasmPath = "../web/gen/hunalign.wasm";
const dictPath = "../web/test/hunapertium-eng-fra.dic";
const frenchPath = "../web/test/chapitre.sentences.txt";
const englishPath = "../web/test/chapter.sentences.txt";

const [wasmBinary, dict, french, english] = await Promise.all(
  [wasmPath, dictPath, frenchPath, englishPath]
    .map((path) => Deno.readFile(fromFileUrl(import.meta.resolve(path)))),
);

const hunalign = await Hunalign.create(wasmBinary);
console.log(hunalign.run(dict, french, english));
