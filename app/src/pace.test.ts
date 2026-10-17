import { test } from "node:test";
import assert from "node:assert/strict";
import { dayFraction, pace } from "./pace.ts";

const w = { startHour: 7, endHour: 22 };

// EX: Pace figure compares eaten calories with the plan for the time of day (US-01m3rvr64zrzczabckjf6crb2z).
test("at 14:20 with 1,900 kcal and 720 eaten the user is 209 kcal under the pace", () => {
  const r = pace(1900, 720, 14 * 60 + 20, w);
  assert.equal(r.planned, 929);
  assert.equal(r.gap, -209);
  assert.equal(r.behind, true);
});

test("the plan is 0 before the window starts and the whole goal after it ends", () => {
  assert.equal(dayFraction(6 * 60, w), 0);
  assert.equal(dayFraction(23 * 60, w), 1);
  assert.equal(pace(1900, 100, 6 * 60, w).planned, 0);
  assert.equal(pace(1900, 100, 23 * 60, w).planned, 1900);
});

test("ahead of the plan is a positive gap and not behind", () => {
  const r = pace(1900, 1200, 12 * 60, w);
  assert.ok(r.gap > 0);
  assert.equal(r.behind, false);
});

test("a window that ends before it starts is rejected", () => {
  assert.throws(() => dayFraction(600, { startHour: 22, endHour: 7 }));
});
