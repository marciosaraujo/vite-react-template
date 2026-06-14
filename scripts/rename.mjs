#!/usr/bin/env node
// Renames this template after you create a repo from it.
// Usage: node scripts/rename.mjs my-new-name
import { readFile, writeFile } from "node:fs/promises";

const newName = process.argv[2];
if (!newName) {
	console.error("Usage: node scripts/rename.mjs <new-project-name>");
	process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(newName)) {
	console.error("Name must be lowercase letters, numbers, and dashes.");
	process.exit(1);
}

const OLD = "vite-react-template";

async function patch(file, patches) {
	let text = await readFile(file, "utf8");
	for (const [from, to] of patches) text = text.split(from).join(to);
	await writeFile(file, text);
	console.log(`updated ${file}`);
}

// package.json: "name" field
const pkg = JSON.parse(await readFile("package.json", "utf8"));
pkg.name = newName;
await writeFile("package.json", JSON.stringify(pkg, null, "\t") + "\n");
console.log("updated package.json");

// wrangler.json: Worker name (what it deploys as)
await patch("wrangler.json", [[`"name": "${OLD}"`, `"name": "${newName}"`]]);

console.log(`\nDone. Renamed "${OLD}" -> "${newName}".`);
console.log("Review wrangler.json and README.md, then commit.");
