import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete Sable landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Sable — Transportation spend, understood\.<\/title>/i);
  assert.match(html, /Every freight charge/);
  assert.match(html, /Request a complimentary audit/);
  assert.match(html, /Synthetic data—not a customer claim/);
  assert.match(html, /src="\/sable-mark-upper\.svg"/);
  assert.match(html, /src="\/sable-mark-lower\.svg"/);
  assert.match(html, /http:\/\/localhost:3000\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("uses the traced vector mark on the green opening scene", async () => {
  const [css, mark, lowerMark] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/sable-mark.svg", import.meta.url), "utf8"),
    readFile(new URL("../public/sable-mark-lower.svg", import.meta.url), "utf8"),
  ]);

  assert.match(css, /mask:\s*url\("\/sable-mark\.svg"\)/);
  assert.match(css, /\.scene-sticky[\s\S]*?background:\s*var\(--forest\)/);
  assert.match(css, /--split-progress:\s*0/);
  assert.match(css, /\.split-scene\.motion-ready \.split-mark--hero[\s\S]*?visibility:\s*hidden/);
  assert.match(css, /\.scene-split[\s\S]*?left:\s*var\(--split-x\)/);
  assert.doesNotMatch(css, /\.hero-piece--upper\s*\{[^}]*scale\(/);
  assert.doesNotMatch(css, /\.hero-piece--(?:upper|lower)\s*\{[^}]*rotate\(/);
  assert.equal((mark.match(/<path\b/g) ?? []).length, 2);
  assert.match(mark, /viewBox="30 15 112 154"/);
  assert.match(mark, /l55-48Z/);
  assert.doesNotMatch(mark, /l57-48Z/);
  assert.match(mark, /L73 95V77/);
  assert.match(lowerMark, /C139 109\.705 141 101\.662 133 99\.191L100 89Z/);
});

test("uses tan editorial sections and a green contact close", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /--ivory:\s*#f6f4ef/i);
  assert.doesNotMatch(css, /color:\s*#fff(?:fff)?\b/i);
  assert.match(css, /\.checks-section\s*\{[^}]*color:\s*var\(--ivory\)/);
  assert.match(css, /\.method\s*\{[^}]*color:\s*var\(--ivory\)/);
  assert.match(css, /\.thesis\s*\{[\s\S]*?background:\s*var\(--stone\)/);
  assert.match(css, /\.proof\s*\{[\s\S]*?background:\s*var\(--stone\)/);
  assert.match(css, /\.contact\s*\{[\s\S]*?background:\s*var\(--forest\)[\s\S]*?color:\s*var\(--ivory\)/);
});
