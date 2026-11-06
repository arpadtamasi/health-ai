import { test } from "node:test";
import assert from "node:assert/strict";
import { reasonOf, recordOf } from "./failure.ts";

// EX-01m6rhz632532q600eazqvxsfe (A photo that did not reach the service is not blamed on the photo).
test("a failed message says why, and blames the photo only when the service said so", () => {
  assert.equal(reasonOf(0, "network"), "network");
  assert.equal(reasonOf(0, "timeout"), "timeout");
  assert.equal(reasonOf(502, "failed"), "server");
  assert.equal(reasonOf(400, "invalid_request"), "refused");
  assert.equal(reasonOf(429, "daily_limit"), "daily_limit");
  assert.equal(reasonOf(200, "image_unreadable"), "photo");
  assert.deepEqual(recordOf("send", 0, "network", true), { stage: "send", status: 0, code: "network", photo: true });
});
