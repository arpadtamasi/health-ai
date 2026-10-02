import { test } from "node:test";
import assert from "node:assert/strict";
import { barOf, chartOf, judgeHero, minutesOf, type DayEntry, type DayInput } from "./day.ts";

const goals = { calories: 2100, protein: 160, carbs: 185, fat: 80, waterMl: 2500 };
const window = { startHour: 7, endHour: 22 };
const day = (minutes: number, eaten: Partial<DayInput["eaten"]>): DayInput => ({ goals, window, minutes, eaten: { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, ...eaten } });
const meal = (id: string, at: number, kcal: number, protein = 0): DayEntry => ({ id, kind: "meal", name: id, kcal, carbs: 0, protein, fat: 0, at, source: "button", estimate: false, ingredients: [] });
const tz = "Europe/Budapest";
const at = (hhmm: string) => Date.parse(`2026-10-02T${hhmm}:00+02:00`);

// EX: The hero is red when the calories are 200 under the plan (BR-01m3y1…: The hero's colour states the situation).
test("the hero is red when the calories are far under the plan", () => {
  const h = judgeHero(day(17 * 60 + 40, { calories: 1300 }), [meal("a", at("08:00"), 1300)]);
  assert.equal(h.tone, "behind");
  assert.equal(h.kind, "under");
  assert.equal(h.amount, 190); // the plan at 17:40 is about 1,493 kcal
});

// EX: The hero is yellow within 120 kcal of the plan.
test("the hero is yellow within 120 kcal of the plan, and ahead counts as on track", () => {
  const near = judgeHero(day(14 * 60 + 20, { calories: 1000 }), [meal("a", at("08:00"), 1000)]);
  assert.equal(near.tone, "ok");
  assert.equal(near.kind, "on");
  assert.equal(judgeHero(day(12 * 60 + 15, { calories: 1430 }), [meal("a", at("08:00"), 1430)]).kind, "ahead");
});

// EX: The hero is dark when the day is closed.
test("the hero is dark once the window is over or the goal reached", () => {
  assert.equal(judgeHero(day(22 * 60 + 20, { calories: 2000 }), [meal("a", at("08:00"), 2000)]).tone, "done");
  assert.equal(judgeHero(day(20 * 60, { calories: 2105 }), [meal("a", at("08:00"), 2105)]).tone, "done");
});

test("before the first log there is no judgement, and in the first two hours of the window the hero does not call a lag", () => {
  assert.equal(judgeHero(day(7 * 60 + 2, {}), []).kind, "morning");
  assert.equal(judgeHero(day(8 * 60 + 30, { calories: 100 }), [meal("a", at("08:00"), 100)]).kind, "start");
});

// EX: Tapping the protein bar puts protein in the hero.
test("another metric is judged by its own plan, with an eight percent margin", () => {
  const d = day(17 * 60 + 40, { calories: 1300, protein: 70 });
  const h = judgeHero(d, [meal("a", at("08:00"), 1300, 70)], "p");
  assert.equal(h.tone, "behind");
  assert.equal(h.metric, "p");
  assert.ok(h.amount >= 40 && h.amount <= 48, String(h.amount));
});

// EX: The fat bar shows the cap and not a pace.
test("fat is a limit: the hero says how much is left, and the bar has a cap instead of a pace tick", () => {
  const d = day(17 * 60 + 40, { fat: 72 });
  const h = judgeHero(d, [], "f");
  assert.deepEqual([h.kind, h.amount, h.tone], ["fatLeft", 8, "ok"]);
  const bar = barOf(d, "f");
  assert.equal(bar.limit, true);
  assert.equal(bar.tick, 100);
  assert.equal(bar.left, 8);
  assert.equal(judgeHero(day(10 * 60, { fat: 90 }), [], "f").tone, "behind");
});

test("a minimum bar says what is to go, and is behind when it is more than eight points under the plan", () => {
  const bar = barOf(day(17 * 60 + 40, { protein: 70 }), "p");
  assert.equal(bar.left, 90);
  assert.equal(bar.behind, true);
  assert.equal(barOf(day(10 * 60, { protein: 160 }), "p").done, true);
});

test("the chart is a staircase of what was logged up to now, per metric", () => {
  const entries = [meal("b", at("07:30"), 415, 17), meal("l", at("12:00"), 640, 38), meal("late", at("21:00"), 100, 1)];
  const c = chartOf(day(15 * 60, { calories: 1055 }), entries, "kcal", tz);
  assert.deepEqual(c.steps.map((s) => s.total), [415, 1055]);
  assert.ok(c.nowX > c.steps[1]!.x);
  assert.equal(c.limit, false);
  assert.deepEqual(chartOf(day(15 * 60, {}), entries, "p", tz).steps.map((s) => s.total), [17, 55]);
  assert.equal(chartOf(day(15 * 60, {}), entries, "f", tz).planNow, undefined);
});

test("the minutes of an instant are read in the person's own time zone", () => {
  assert.equal(minutesOf(Date.parse("2026-10-02T05:10:00Z"), tz), 7 * 60 + 10);
  assert.equal(minutesOf(Date.parse("2026-10-02T05:10:00Z"), "America/New_York"), 60 + 10);
});
