import randomString, {RandomCharSet} from "@/util/randomString.ts";
import type ValueFrom from "@t/ValueFrom.ts";

export default class RandomNamespace {
	#id: string;
	constructor(length: number = 5, prefix: string = "_", charset: ValueFrom<typeof RandomCharSet> = RandomCharSet.biased) {
		this.#id = randomString(length, prefix, "", charset);
	}
	setId(id: string): void {
		this.#id = id;
	}
	id(suffix: string): string {
		return this.#id + suffix;
	}
	fragment(suffix: string): string {
		return "#" + this.id(suffix);
	}
	url(suffix: string, quote: string = "'"): string {
		return `url(${quote}#${this.id(suffix)}${quote})`;
	}
}