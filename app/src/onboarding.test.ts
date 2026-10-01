import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultGoals, parseCalories, parseConstraints, parseWindow } from "./onboarding.ts";

// EX: The first chat sets constraints, goal and window before any suggestion (US-01m3rw2bqxkqp6v1hg9g02t1zr).
test("the typed answers become constraints, calories and a window", () => {
  assert.deepEqual(parseConstraints("Nuts, and I don't like fish"), ["nuts", "i don't like fish"]);
  assert.equal(parseCalories("1900, from 7 to 22".split(",")[0]!), 1900);
  assert.deepEqual(parseWindow("from 7 to 22"), { startHour: 7, endHour: 22 });
});

test("none means an explicit empty list", () => {
  assert.deepEqual(parseConstraints("none"), []);
  assert.deepEqual(parseConstraints("  "), []);
});

test("calories accept separators and reject nonsense", () => {
  assert.equal(parseCalories("1,900 kcal"), 1900);
  assert.equal(parseCalories("50"), undefined);
  assert.equal(parseCalories("lots"), undefined);
});

test("a window must end after it starts", () => {
  assert.deepEqual(parseWindow("7-22"), { startHour: 7, endHour: 22 });
  assert.equal(parseWindow("22-7"), undefined);
  assert.equal(parseWindow("later"), undefined);
});

test("the default split is half carbs and a quarter protein", () => {
  assert.deepEqual(defaultGoals(1900), { calories: 1900, carbs: 238, protein: 119 });
});
