import { test } from "node:test";
import assert from "node:assert/strict";
import { isNewer, onComeBack, publishedBuild } from "./update.ts";

const idle = { typing: false, sheetOpen: false, writing: false };

// EX-01m6p2r52g2z53nsyd9g8ney8y (A new version loads when the app comes back from the background).
test("a newer build loads when the app comes back with nothing typed, no sheet and no write waiting", () => {
  assert.equal(onComeBack(isNewer("a1", "b2"), idle), "reload");
});

// EX-01m6p2r597gw7850rrrcnnfhvx (While a message is being typed the new version waits): the day is loaded, the page is not.
test("while a message is typed, a sheet is open or a write waits, the new version waits and only the day is loaded", () => {
  assert.equal(onComeBack(true, { ...idle, typing: true }), "load");
  assert.equal(onComeBack(true, { ...idle, sheetOpen: true }), "load");
  assert.equal(onComeBack(true, { ...idle, writing: true }), "load");
  // the next time it comes back with none of these, it loads the new version
  assert.equal(onComeBack(true, idle), "reload");
});

// EX-01m6p2r5ggm7nvtshx8yn4t4xs (A meal logged in Claude is on the plate when the app comes back): no new version, the day is loaded.
test("without a newer build the app loads the day again", () => {
  assert.equal(onComeBack(isNewer("a1", "a1"), idle), "load");
});

test("an unknown build (development, offline) is never newer", () => {
  assert.equal(isNewer("", "b2"), false);
  assert.equal(isNewer("a1", null), false);
});

test("the published build is read past the cache, and a failed read gives null", async () => {
  let seen: RequestInit | undefined;
  const ok = (async (_u: string, init?: RequestInit) => { seen = init; return new Response(JSON.stringify({ build: "b2" })); }) as typeof fetch;
  assert.equal(await publishedBuild(ok), "b2");
  assert.equal(seen?.cache, "no-store");
  assert.equal(await publishedBuild((async () => new Response("", { status: 404 })) as typeof fetch), null);
  assert.equal(await publishedBuild((async () => { throw new Error("offline"); }) as typeof fetch), null);
});
