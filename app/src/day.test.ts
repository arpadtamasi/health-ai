import { test } from "node:test";
import assert from "node:assert/strict";
import { judgeHero, minutesOf, type DayEntry, type DayInput } from "./day.ts";

const goals = { calories: 2100, protein: 160, carbs: 185, fat: 80, waterMl: 2500 };
const window = { startHour: 7, endHour: 22 };
const day = (minutes: number, eaten: Partial<DayInput["eaten"]>): DayInput => ({ goals, window, minutes, eaten: { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, ...eaten } });
const meal = (id: string, at: number, kcal: number, protein = 0): DayEntry => ({ id, kind: "meal", name: id, kcal, carbs: 0, protein, fat: 0, at, source: "button", estimate: false, ingredients: [] });
const tz = "Europe/Budapest";
const at = (hhmm: string) => Date.parse(`2026-10-02T${hhmm}:00+02:00`);

// EX-01m3y1pthj3qcq57gf9km40rqw (The line says how far under the plan, and nothing turns red), BR-01m6m4323nzt0ma6qf6j5a0yxa.
test("the calories are judged under the plan when they are far under it", () => {
  const h = judgeHero(day(17 * 60 + 40, { calories: 1300 }), [meal("a", at("08:00"), 1300)]);
  assert.equal(h.tone, "behind");
  assert.equal(h.kind, "under");
  assert.equal(h.amount, 190); // the plan at 17:40 is about 1,493 kcal
});

// EX-01m3y1ptvks1k8pxkzpe89stx5 (Within 120 kcal of the plan the line says on the plan).
test("within 120 kcal of the plan the day is on the plan, and further above it is ahead", () => {
  const near = judgeHero(day(14 * 60 + 20, { calories: 1000 }), [meal("a", at("08:00"), 1000)]);
  assert.equal(near.tone, "ok");
  assert.equal(near.kind, "on");
  assert.equal(judgeHero(day(12 * 60 + 15, { calories: 1430 }), [meal("a", at("08:00"), 1430)]).kind, "ahead");
});

// EX-01m3y1pv379hwqmt3jfsqz9p9v (When the day is closed the line says the day is done).
test("the day is done once the window is over or the goal reached", () => {
  assert.equal(judgeHero(day(22 * 60 + 20, { calories: 2000 }), [meal("a", at("08:00"), 2000)]).tone, "done");
  assert.equal(judgeHero(day(20 * 60, { calories: 2105 }), [meal("a", at("08:00"), 2105)]).tone, "done");
});

test("before the first log there is no judgement, and in the first two hours of the window no lag is called", () => {
  assert.equal(judgeHero(day(7 * 60 + 2, {}), []).kind, "morning");
  assert.equal(judgeHero(day(8 * 60 + 30, { calories: 100 }), [meal("a", at("08:00"), 100)]).kind, "start");
});

// EX-01m3y1pt0jf372my3204evety1 (Tapping the protein third puts protein in the line).
test("another metric is judged by its own plan, with an eight percent margin", () => {
  const d = day(17 * 60 + 40, { calories: 1300, protein: 70 });
  const h = judgeHero(d, [meal("a", at("08:00"), 1300, 70)], "p");
  assert.equal(h.tone, "behind");
  assert.equal(h.metric, "p");
  assert.ok(h.amount >= 40 && h.amount <= 48, String(h.amount));
});

// EX-01m3y1ptc4mfsg0c8vbcjm3w2z (The fat third shows the cap): fat is a limit, the line says how much is left or how far it is over.
test("fat is a limit: what is left of the cap, or over it", () => {
  const h = judgeHero(day(17 * 60 + 40, { fat: 72 }), [], "f");
  assert.deepEqual([h.kind, h.amount, h.tone], ["fatLeft", 8, "ok"]);
  assert.equal(judgeHero(day(10 * 60, { fat: 90 }), [], "f").kind, "fatOver");
});

test("the minutes of an instant are read in the person's own time zone", () => {
  assert.equal(minutesOf(Date.parse("2026-10-02T05:10:00Z"), tz), 7 * 60 + 10);
  assert.equal(minutesOf(Date.parse("2026-10-02T05:10:00Z"), "America/New_York"), 60 + 10);
});
