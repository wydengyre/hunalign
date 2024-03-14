import { expose } from "comlink";
import mkHunalign from "../../build/hunalign.js";

export type { Config, LogFn, RunFn };
expose(run);

type Config = Readonly<{
	dictionary: Uint8Array;
	source: Uint8Array;
	target: Uint8Array;
	print: LogFn;
	printErr: LogFn;
}>;
type LogFn = (str: string) => void;
type RunFn = (conf: Config) => Promise<void>;

async function run(conf: Config): Promise<void> {
	const hunalignConfig: Partial<EmscriptenModule> = {
		print: conf.print,
		printErr: conf.printErr,
	};
	const module = await mkHunalign(hunalignConfig);
	module.FS.writeFile("/dictionary", conf.dictionary);
	module.FS.writeFile("/source", conf.source);
	module.FS.writeFile("/target", conf.target);
	module.callMain(["dictionary", "source", "target"]);
}
