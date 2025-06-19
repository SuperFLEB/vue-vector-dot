import {execSync} from "node:child_process";
import {readFileSync, writeFileSync, existsSync} from "node:fs";

const pjPath = process.argv[2];
const argv = process.argv.slice(3);

if (!(pjPath && pjPath.endsWith("json") && existsSync(pjPath))) {
	console.error("Invalid package.json path specified.");
	console.error("Usage: node bump.mjs ./path/to/package.json [major|minor|patch]");
	process.exit(1);
}

const packageJson = JSON.parse(readFileSync(pjPath).toString());

try {
	execSync("git diff --quiet --exit-code");
} catch (e) {
	console.log("Working directory is not clean. Commit before bumping.");
	process.exit(1);
}

let version = /^\d+\.\d+\.\d+$/.test(packageJson.version) ? packageJson.version.split(".").map(v => Number(v)) : [0, 0, 0];
let bumpPart = ["major", "minor", "patch"].findIndex(p => argv.includes(p));
if (bumpPart === -1) bumpPart = 2;
const newVersion = [...version.slice(0, bumpPart), version[bumpPart] + 1, 0, 0, 0].slice(0, 3);

console.log(version.join('.'), "-->", newVersion.join('.'));

const newVersionString = newVersion.join('.');
packageJson.version = newVersionString;
writeFileSync(pjPath, JSON.stringify(packageJson, null, 2));

execSync("git add " + pjPath);
// execSync(`git commit -m"Update package.json version to ${newVersionString}"`);
// execSync(`git tag "${newVersionString}"`);
