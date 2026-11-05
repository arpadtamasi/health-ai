import { test } from "node:test";
import assert from "node:assert/strict";
import { dayOf, isNewDay, todaysTurns } from "./daypage.ts";

const tz = "Europe/Budapest";
const at = (s: string) => Date.parse(s);

// EX-01m6py99nbp6t6ctsbpzh6q29y (A new day starts a new page in the conversation): yesterday's messages are neither shown nor sent.
test("a new day starts a new page", () => {
  const turns = [{ at: at("2026-11-05T21:30:00+01:00"), text: "tegnapi" }, { at: at("2026-11-05T23:59:00+01:00"), text: "éjfél előtt" }, { at: at("2026-11-06T07:10:00+01:00"), text: "Ettem egy joghurtot" }];
  const now = at("2026-11-06T07:11:00+01:00");
  assert.deepEqual(todaysTurns(turns, tz, now).map((t) => t.text), ["Ettem egy joghurtot"]);
  // the day is the person's: 23:30 UTC is already tomorrow in Budapest
  assert.equal(dayOf(at("2026-11-05T23:30:00Z"), tz), "2026-11-06");
});

// EX-01m3y2d5jng87ap6mmb7shz36n (Reopening the app shows the conversation again): the same day keeps its page.
test("the same day keeps its page; the next day starts a new one when the app comes back", () => {
  assert.equal(isNewDay("2026-11-05", tz, at("2026-11-05T16:00:00+01:00")), false);
  assert.equal(isNewDay("2026-11-05", tz, at("2026-11-06T00:05:00+01:00")), true);
});
