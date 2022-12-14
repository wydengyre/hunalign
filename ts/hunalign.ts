import mkHunalign from "../build/hunalign.js";
// based on https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/emscripten/index.d.ts
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

export type Rung = [number, number, number];
export type Ladder = Rung[];

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
  ): Ladder {
    this.#module.FS.writeFile("/dictionary", dictionary);
    this.#module.FS.writeFile("/source", source);
    this.#module.FS.writeFile("/target", target);
    this.#module.callMain(["dictionary", "source", "target"]);

    return toLadder(this.#printLog);
  }

  static async create(wasmBinary?: Uint8Array): Promise<Hunalign> {
    const printLog: string[] = [];
    function print(text: string): void {
      printLog.push(text);
    }

    const module = await mkHunalign({print, wasmBinary});
    return new Hunalign(module, printLog);
  }
}

function toLadder(prints: string[]): Ladder {
  return prints.map((s) => toRung(s));
}

function toRung(s: string): Rung {
  const nums = s.split("\t");
  if (nums.length !== 3) {
    throw `could not convert ${nums} to rung`;
  }
  return [parseInt(nums[0]), parseInt(nums[1]), Number.parseFloat(nums[2])];
}
