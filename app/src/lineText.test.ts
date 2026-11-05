import { test } from "node:test";
import assert from "node:assert/strict";
import { judgeHero, type DayEntry, type DayInput } from "./day.ts";
import { lineWords } from "./lineText.ts";
import { TEXTS } from "./texts.ts";

const goals = { calories: 2100, protein: 160, carbs: 185, fat: 80, waterMl: 2500 };
const window = { startHour: 7, endHour: 22 };
const day = (minutes: number, eaten: Partial<DayInput["eaten"]>): DayInput => ({ goals, window, minutes, eaten: { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, ...eaten } });
const meal = (kcal: number): DayEntry => ({ id: "a", kind: "meal", name: "a", kcal, carbs: 0, protein: 0, fat: 0, at: 0, source: "button", estimate: false, ingredients: [] });
const plan = (m: number) => (2100 * (m - 420)) / 900;

// EX-01m3y1pthj3qcq57gf9km40rqw (The line says how far under the plan, and nothing turns red).
test("the line says how far under the plan, in words and with the mark for under the plan", () => {
  const d = day(17 * 60 + 40, { calories: 1300, protein: 140 });
  const l = lineWords(judgeHero(d, [meal(1300)]), d, TEXTS.hu, plan(17 * 60 + 40));
  assert.equal(l.mark, "behind");
  assert.equal(l.text, "190 kcal-lal a terv alatt.");
  assert.equal(lineWords(judgeHero(d, [meal(1300)]), d, TEXTS.en, plan(17 * 60 + 40)).text, "190 kcal under the plan.");
});

// EX-01m3y1ptvks1k8pxkzpe89stx5 (Within 120 kcal of the plan the line says on the plan).
test("within 120 kcal of the plan the line says on the plan", () => {
  const d = day(14 * 60 + 20, { calories: 1000, protein: 100 });
  const l = lineWords(judgeHero(d, [meal(1000)]), d, TEXTS.hu, plan(14 * 60 + 20));
  assert.deepEqual([l.mark, l.text], ["on", "A terven vagy."]);
});

// EX-01m3y1pv379hwqmt3jfsqz9p9v (When the day is closed the line says the day is done).
test("when the day is closed the line says the day is done, with one line for tomorrow", () => {
  const d = day(22 * 60 + 20, { calories: 2100, protein: 150 });
  const l = lineWords(judgeHero(d, [meal(2100)]), d, TEXTS.hu, plan(22 * 60));
  assert.deepEqual([l.mark, l.text, l.sub], ["done", "Mára kész.", "Holnap reggel a terv: +10 g fehérje."]);
});

// EX-01m3y1pt0jf372my3204evety1 (Tapping the protein third puts protein in the line).
test("a chosen macro is named in the line, with its own figures under it", () => {
  const d = day(17 * 60 + 40, { calories: 1300, protein: 70 });
  const l = lineWords(judgeHero(d, [meal(1300)], "p"), d, TEXTS.hu, 0);
  assert.equal(l.mark, "behind");
  assert.match(l.text, /^Fehérje: \d+ g-mal a terv alatt\.$/);
  assert.equal(l.sub, "70 g a 160 g-ból.");
  const w = lineWords(judgeHero(day(13 * 60, { waterMl: 500 }), [], "w"), day(13 * 60, { waterMl: 500 }), TEXTS.hu, 0);
  assert.equal(w.text, "Víz: 0,5 l-rel a terv alatt.");
  assert.equal(w.sub, "0,5 l a 2,5 l-ből.");
});

// EX-01m3y1ptc4mfsg0c8vbcjm3w2z (The fat third shows the cap) and EX-01m6m432r02t0w6ex4nb3ga68e (Fat over the cap spills).
test("fat says what is left of the cap, or how far it is over", () => {
  const near = day(17 * 60 + 40, { fat: 72 });
  assert.deepEqual(Object.values(lineWords(judgeHero(near, [], "f"), near, TEXTS.hu, 0)), ["behind", "Zsír: 8 g maradt a keretből.", "A 80 g-os keretből 72 g elfogyott."]);
  const over = day(21 * 60, { fat: 83 });
  assert.equal(lineWords(judgeHero(over, [], "f"), over, TEXTS.hu, 0).text, "Zsír: 3 g-mal a keret fölött.");
});

// EX-01m3rvsqnw1hdzx9fsh390z7z9 (Pace figure compares eaten calories with the plan for the time of day): 1,900 kcal over 7:00 to
// 22:00, 720 eaten at 14:20, the plan for now is 929.
test("the line compares the calories with the plan for the time of day, rounded to tens", () => {
  const d: DayInput = { goals: { ...goals, calories: 1900 }, window, minutes: 14 * 60 + 20, eaten: { calories: 720, protein: 140, carbs: 0, fat: 0, waterMl: 0 } };
  const l = lineWords(judgeHero(d, [meal(720)]), d, TEXTS.hu, (1900 * (14 * 60 + 20 - 420)) / 900);
  assert.equal(l.text, "210 kcal-lal a terv alatt.");
  assert.equal(l.sub, "Most 930 kcal-nál kellene tartanod.");
});

// EX-01m6nzdzb7rnfv9p4wf8rpdk03 (Calories over the goal say how far over, not done), BR-01m6nzdyz40bdbmtbn9ffze1v5.
test("over the calorie goal by more than 50 kcal the line says how far over, and never done", () => {
  const d: DayInput = { goals, window, minutes: 17 * 60, eaten: { calories: 2735, protein: 95, carbs: 300, fat: 92, waterMl: 0 } };
  const l = lineWords(judgeHero(d, [meal(2735)]), d, TEXTS.hu, 0);
  assert.deepEqual([l.mark, l.text, l.sub], ["behind", "Kereten felül: +635 kcal.", "Szénhidrátból +115 g, zsírból +12 g."]);
  const near: DayInput = { ...d, minutes: 22 * 60 + 20, eaten: { ...d.eaten, calories: 2140, carbs: 180, fat: 70 } };
  assert.equal(lineWords(judgeHero(near, [meal(2140)]), near, TEXTS.hu, 0).text, "Mára kész.");
});

// EX-01m6nzdzran5ypw802pjhjvnaj (At 21:40 the line says what still fits), BR-01m6nzdz57xbc4k501gg85aytx.
test("from three hours before the window ends the line says what still fits, with the protein in it", () => {
  const d: DayInput = { goals, window, minutes: 21 * 60 + 40, eaten: { calories: 1630, protein: 118, carbs: 150, fat: 62, waterMl: 0 } };
  const l = lineWords(judgeHero(d, [meal(1630)]), d, TEXTS.hu, 0);
  assert.deepEqual([l.text, l.sub], ["Ma még 470 kcal fér bele.", "Ebből 42 g fehérje."]);
  const before: DayInput = { ...d, minutes: 18 * 60 + 50 };
  assert.notEqual(judgeHero(before, [meal(1630)]).kind, "evening");
});
