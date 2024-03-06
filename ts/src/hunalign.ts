import mkHunalign from "../../build/hunalign.js";

export type { Hunalign, Ladder, Rung };
export { create };

type Rung = [number, number, number];
type Ladder = Rung[];
type Hunalign = {
	run: (
		dictionary: Uint8Array,
		source: Uint8Array,
		target: Uint8Array,
	) => Ladder;
};

async function create(): Promise<Hunalign> {
	const printLog: string[] = [];
	const print = (text: string) => {
		printLog.push(text);
	};

	const module = await mkHunalign({ print });

	const run = (
		dictionary: Uint8Array,
		source: Uint8Array,
		target: Uint8Array,
	) => {
		module.FS.writeFile("/dictionary", dictionary);
		module.FS.writeFile("/source", source);
		module.FS.writeFile("/target", target);
		module.callMain(["dictionary", "source", "target"]);
		return toLadder(printLog);
	};

	return { run };
}
function toLadder(prints: string[]): Ladder {
	return prints.map((s) => toRung(s));
}

function toRung(s: string): Rung {
	const nums = s.split("\t");
	if (nums.length !== 3) {
		throw `could not convert ${nums} to rung`;
	}
	return [
		parseInt(nums[0] as string),
		parseInt(nums[1] as string),
		Number.parseFloat(nums[2] as string),
	];
}
