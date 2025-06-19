import {execSync} from "node:child_process";

try {
	execSync("git diff --quiet --exit-code");
} catch (e) {
	console.log("Working directory is not clean. Commit before bumping.");
	process.exit(1);
}

