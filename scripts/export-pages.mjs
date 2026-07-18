import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectDir = process.cwd();
const clientDir = path.join(projectDir, "dist", "client");
const outputDir = path.join(projectDir, ".pages-dist");
const repository = process.env.GITHUB_REPOSITORY ?? "jelwoodiii/freight-audit-website";
const [owner, repositoryName] = repository.split("/");

if (!owner || !repositoryName) {
  throw new Error(`Invalid GITHUB_REPOSITORY value: ${repository}`);
}

const basePath = `/${repositoryName}/`;
const host = `${owner}.github.io`;
const origin = `https://${host}`;
const publicAssets = [
  "assets/",
  "favicon.svg",
  "og.png",
  "sable-mark-lower.svg",
  "sable-mark-upper.svg",
  "sable-mark.svg",
];

function rewritePublicPaths(source) {
  return publicAssets.reduce(
    (result, asset) => result.replaceAll(`/${asset}`, `${basePath}${asset}`),
    source,
  );
}

async function rewriteBuiltAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteBuiltAssets(entryPath);
    } else if (/\.(?:css|html|js)$/.test(entry.name)) {
      const source = await readFile(entryPath, "utf8");
      await writeFile(entryPath, rewritePublicPaths(source));
    }
  }
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(clientDir, outputDir, { recursive: true });
await rewriteBuiltAssets(outputDir);

const workerUrl = pathToFileURL(path.join(projectDir, "dist", "server", "index.js"));
workerUrl.searchParams.set("pages-export", `${Date.now()}`);
const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request(`${origin}/`, {
    headers: {
      accept: "text/html",
      "x-forwarded-host": host,
      "x-forwarded-proto": "https",
    },
  }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) {
  throw new Error(`Static render failed with status ${response.status}`);
}

const html = rewritePublicPaths(await response.text());
if (html.includes("http://localhost") || !html.includes(`${basePath}assets/`)) {
  throw new Error("Static render contains unresolved deployment paths");
}

await writeFile(path.join(outputDir, "index.html"), html);
await writeFile(path.join(outputDir, "404.html"), html);
await writeFile(path.join(outputDir, ".nojekyll"), "");

console.log(`GitHub Pages artifact ready at ${outputDir}`);
