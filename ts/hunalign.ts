import mkHunalign from "../web/gen/hunalign.js";
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

