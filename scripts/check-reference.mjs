// Checks that each component page shows its reference implementation as it is:
// every code block titled with a file name, like ```vue [Button.vue], must match
// that file in app/reference/<component>/, and every file there must be shown.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const REFERENCE = "app/reference";
const PAGES = "content/docs";

const pages = (await readdir(PAGES, { recursive: true })).filter((path) => path.endsWith(".md"));
const problems = [];

for (const component of await readdir(REFERENCE)) {
  // The page is named after the component, card.md, or it's split into a folder
  // named after it, button/, with the code on one of its parts.
  const unnumbered = (name) => name.replace(/^\d+\./, "");
  const files = pages.filter((path) => {
    const parts = path.split("/").map(unnumbered);
    return parts.at(-1) === `${component}.md` || parts.at(-2) === component;
  });
  if (!files.length) {
    problems.push(`${REFERENCE}/${component}: no page named ${component}.md, or folder named ${component}, in ${PAGES}`);
    continue;
  }
  const page = files.length === 1 ? files[0] : `${files[0].split("/").slice(0, -1).join("/")}/`;
  const markdown = (await Promise.all(files.map((file) => readFile(join(PAGES, file), "utf8")))).join("\n");
  const blocks = new Map(
    [...markdown.matchAll(/^```\w+ \[(.+?)\]\n([\s\S]*?)^```$/gm)].map(([, name, code]) => [name, code]),
  );
  for (const file of await readdir(join(REFERENCE, component))) {
    const code = blocks.get(file);
    const source = await readFile(join(REFERENCE, component, file), "utf8");
    if (code === undefined) problems.push(`${PAGES}/${page} doesn't show ${file}`);
    else if (code.trim() !== source.trim()) problems.push(`${PAGES}/${page} shows an outdated ${file}`);
  }
}

if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"));
  process.exit(1);
}
console.log("✓ The component pages show their reference implementations as they are.");
