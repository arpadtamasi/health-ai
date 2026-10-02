import { test } from "node:test";
import assert from "node:assert/strict";
import { netStatus, subscribe, track, withRetry, withTimeout } from "./net.ts";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// QA "The app stays usable on a slow response": the screen learns that a call is slow, and the status clears when it ends.
test("a call that takes longer than the limit turns the status slow, and it clears when the call ends", async () => {
  const seen: boolean[] = [];
  const off = subscribe((s) => seen.push(s.slow));
  const done = track(wait(60), 20);
  await wait(35);
  assert.equal(netStatus().slow, true);
  await done;
  assert.equal(netStatus().slow, false);
  assert.equal(netStatus().pending, 0);
  assert.ok(seen.includes(true));
  off();
});

test("a quick call never shows as slow", async () => {
  await track(wait(5), 50);
  assert.equal(netStatus().slow, false);
});

test("a failure that repeating can fix is retried, anything else is not", async () => {
  let n = 0;
  const flaky = () => (++n < 3 ? Promise.reject(new Error("net")) : Promise.resolve("ok"));
  assert.equal(await withRetry(flaky, { retries: 2, waitMs: 1, retryable: () => true }), "ok");
  let m = 0;
  await assert.rejects(withRetry(() => { m++; return Promise.reject(new Error("bad")); }, { retries: 2, waitMs: 1, retryable: () => false }));
  assert.equal(m, 1);
});

test("a call that never answers is cut off", async () => {
  await assert.rejects(withTimeout(new Promise(() => undefined), 20, () => new Error("timeout")), /timeout/);
  assert.equal(await withTimeout(Promise.resolve(7), 20, () => new Error("timeout")), 7);
});
