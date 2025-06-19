import {execSync} from "node:child_process";
import isWdClean from "./util/isWdClean.mjs";
import getPackageJson from "./util/packageJson.mjs";

if (!isWdClean()) {
	console.log("Working directory is not clean. Commit before bumping.");
	process.exit(1);
}

function isTagged() {
	const packageJson = getPackageJson();
	const jsonVersion = packageJson.version;
	let gitTagVersion;

	try {
		const tags = execSync(`git describe --exact-match --tags HEAD`).split("\n");
		return tags.includes(jsonVersion);
	} catch (e) {
		return false;
	}
}

if (isTagged()) process.exit(0);

(async () => {
	await import("./bump.mjs");
})();
