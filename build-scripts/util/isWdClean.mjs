import {execSync} from "node:child_process";

export default function isWdClean() {
	try {
		execSync("git diff --quiet --exit-code");
	} catch (e) {
		return false;
	}
	return true;
}