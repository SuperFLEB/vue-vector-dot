import {existsSync, readFileSync} from "node:fs";

export default function getPackageJson() {
	const pjPath = process.argv[2];
	if (!(pjPath && pjPath.endsWith("json") && existsSync(pjPath))) {
		console.error("Invalid package.json path specified. Path to package.json must be the first command argument.");
		process.exit(1);
	}

	return JSON.parse(readFileSync(pjPath).toString());
}


