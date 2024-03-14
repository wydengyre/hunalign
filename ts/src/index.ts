import { type Remote, proxy, wrap } from "comlink";
import type { RunFn, Config as WorkerConfig } from "./worker.js";

export type { Config, Rung};
export { align };

type Config = Readonly<{
	dictionary: Uint8Array;
	source: Uint8Array;
	target: Uint8Array;
}>;

type Rung = [number, number, number];
async function* align(conf: Config): AsyncGenerator<Rung> {
	using worker = usingWorker("worker.js");
	const run: Remote<RunFn> = wrap(worker);

	const rungQueue: Rung[] = [];

	const print = (str: string) => {
		const rung = toRung(str);
		rungQueue.push(rung);
	};
	const printErr = (str: string) => {
		console.error(str);
	};

	const workerConfig: WorkerConfig = {
		...conf,
		print: proxy(print),
		printErr: proxy(printErr),
	};

	let runComplete = false
	const runP = run(workerConfig).then(() => {
		runComplete = true;
	});

	while (!runComplete) {
		while (rungQueue.length > 0) {
			yield rungQueue.shift() as Rung;
		}
		await new Promise((resolve) => setTimeout(resolve, 0));
	}

	await runP;
}

function toRung(s: string): Rung {
	const nums = s.split("\t");
	if (nums.length !== 3) {
		throw new Error(`could not convert ${nums} to rung`);
	}
	return [
		Number.parseInt(nums[0] as string),
		Number.parseInt(nums[1] as string),
		Number.parseFloat(nums[2] as string),
	];
}

type DisposeWorker = Worker & { [Symbol.dispose]: () => void };
function usingWorker(scriptURL: string | URL): DisposeWorker {
	const worker = new Worker(scriptURL, { type: "module" });
	return Object.assign(worker, { [Symbol.dispose]: worker.terminate });
}