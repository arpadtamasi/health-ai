import { test } from "node:test";
import assert from "node:assert/strict";
import { canSendAgain, intentOf, photoTurns, startSide, switchShown } from "./dock.ts";

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
