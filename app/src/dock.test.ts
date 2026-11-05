import { test } from "node:test";
import assert from "node:assert/strict";
import { canSendAgain, fittingUsuals, intentOf, largestGap, photoTurns, startSide, switchShown } from "./dock.ts";

const base = { ready: true, afterWindow: false, mode: "home" as const, armed: false };

// EX-01m6ph6dxygfrqwe2y2raq04vm (Ennék asks for options on the same sheet): on the home the switch is there and its side goes along.
test("the switch is on the home's dock and its side goes with the message", () => {
  assert.equal(switchShown(base), true);
  assert.equal(intentOf(true, "would"), "would");
  // typing from the home's dock keeps the switch; the conversation opened by its button has none
  assert.equal(switchShown({ ...base, mode: "talk", armed: true }), true);
  assert.equal(switchShown({ ...base, mode: "talk", armed: false }), false);
  assert.equal(intentOf(false, "would"), undefined);
});

// EX-01m6nzdzz3r239egz1c4s68a98 (After the eating window What should I eat now is gone): no switch, the dock stays on "Ettem".
test("after the eating window the switch is gone", () => {
  assert.equal(switchShown({ ...base, afterWindow: true }), false);
  assert.equal(switchShown({ ...base, ready: false }), false);
});

// EX-01m6ph6ey8cbd7wre1703xhe7a (The switch explains itself the first time only): it starts on the side used last.
test("the switch starts on the side used last, Ettem the first time", () => {
  assert.equal(startSide(undefined), "ate");
  assert.equal(startSide("would"), "would");
  assert.equal(startSide("nonsense"), "ate");
});

// EX-01m6ph6eawez8cc1g4kd33xszg (A question about the photo still sees the photo): the last two earlier user messages bring photos.
test("the photos of the last two earlier user messages come along, not older ones", () => {
  assert.deepEqual([...photoTurns([0, 2, 4])].sort(), [2, 4]);
  assert.deepEqual([...photoTurns([0])], [0]);
});

// EX-01m6ph6eh98wgvrjw6gyy2r9tr (A message that did not go out can be sent again): Újra, except when the day's limit is used up.
test("a failed message can be sent again, except at the daily limit", () => {
  assert.equal(canSendAgain("timeout"), true);
  assert.equal(canSendAgain(undefined), true);
  assert.equal(canSendAgain("daily_limit"), false);
});

const usual = (name: string, kcal: number, protein: number, count = 1, kind: "meal" | "water" = "meal") => ({ kind, name, kcal, protein, carbs: 10, fat: 5, count });
const goals = { calories: 2100, protein: 160, carbs: 220, fat: 70 };

// EX-01m6pvfvzzq4vs1pfhdczn9kx4 (Ennék offers the usual foods that fit now): protein is furthest behind, so the one with most protein first.
test("Ennék offers the usual foods that fit, the largest gap closed first", () => {
  const left = { calories: 2100 - 660, protein: 125, carbs: 120, fat: 40 };
  const us = [usual("Cappuccino", 90, 5, 9), usual("Túró", 160, 22), usual("Oat bran, milk, jam", 415, 17, 3), usual("Two boiled eggs", 155, 13, 2), usual("Water", 0, 0, 20, "water")];
  assert.deepEqual(fittingUsuals(us, left, goals).map((u) => u.name), ["Túró", "Oat bran, milk, jam", "Two boiled eggs", "Cappuccino"]);
  assert.equal(largestGap(left, goals), "protein");
  // at most four, and a food over what is left drops out
  const many = [...us, usual("Pizza", 900, 30), usual("Skyr", 120, 15)];
  assert.deepEqual(fittingUsuals(many, { ...left, calories: 500 }, goals).map((u) => u.name), ["Túró", "Oat bran, milk, jam", "Skyr", "Two boiled eggs"]);
});

// EX-01m6pvfw80s18pn0szqydw2dn7 (When no usual food fits, Ennék has no chips).
test("when no usual food fits, there are no chips", () => {
  const left = { calories: 40, protein: 10, carbs: 5, fat: 2 };
  assert.deepEqual(fittingUsuals([usual("Cappuccino", 90, 5), usual("Túró", 160, 22)], left, goals), []);
});
