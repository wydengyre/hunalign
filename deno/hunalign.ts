import {Hunalign, Ladder} from "../ts/hunalign.ts";

export class DenoHunalign {
  #hunalign: Hunalign;

  private constructor(hunalign: Hunalign) {
    this.#hunalign = hunalign;
  }

  run(
    dictionary: Uint8Array,
    source: Uint8Array,
    target: Uint8Array,
  ): Ladder {
    return this.#hunalign.run(dictionary, source, target);
  }

  async runWithPaths(dictPath: string, sourcePath: string, targetPath: string): Promise<Ladder> {
    const [dict, source, target] = await Promise.all([
      Deno.readFile(dictPath),
      Deno.readFile(sourcePath),
      Deno.readFile(targetPath)
    ]);
    return this.run(dict, source, target);
  }

  static async createWithWasmBinary(wasmBinary: Uint8Array): Promise<DenoHunalign> {
    const hunalign = await Hunalign.create(wasmBinary);
    return new DenoHunalign(hunalign);
  }

  static async createWithWasmPath(wasmPath: string): Promise<DenoHunalign> {
    const wasmBinary = await Deno.readFile(wasmPath);
    return this.createWithWasmBinary(wasmBinary);
  }
}

const wasmPath = "../build/hunalign.wasm";
const dictPath = "../test/hunapertium-eng-fra.dic";
const frenchPath = "../test/chapitre.sentences.txt";
const englishPath = "../test/chapter.sentences.txt";

const hunalign = await DenoHunalign.createWithWasmPath(wasmPath);
console.log(await hunalign.runWithPaths(dictPath, frenchPath, englishPath));
