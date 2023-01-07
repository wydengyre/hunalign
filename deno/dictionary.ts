import * as path from "std/path/mod.ts";
import { dictionaryFileName, Language } from "../ts/dictionary.ts";
export class DictionaryLoader {
  #dictionaryDir: string;

  private constructor(d: string) {
    this.#dictionaryDir = d;
  }

  dictionaryPathForLanguages(source: Language, target: Language): string {
    const fileName = dictionaryFileName(source, target);
    return path.join(this.#dictionaryDir, fileName);
  }

  dictionaryForLanguages(
    source: Language,
    target: Language,
  ): Promise<Uint8Array> {
    const filePath = this.dictionaryPathForLanguages(source, target);
    return Deno.readFile(filePath);
  }

  static async fromDirectoryPath(s: string): Promise<DictionaryLoader> {
    const resolved = path.resolve(s);
    const { isDirectory } = await Deno.stat(resolved);
    if (!isDirectory) {
      throw `not a directory path: ${s}`;
    }
    return new this(resolved);
  }
}
