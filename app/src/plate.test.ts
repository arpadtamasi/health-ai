import { test } from "node:test";
import assert from "node:assert/strict";
import { glassText, layersOf, mainOf, partOf, radiusAt, spillRadius } from "./plate.ts";
import type { DayEntry, DayInput } from "./day.ts";

const goals = { calories: 2100, protein: 160, carbs: 185, fat: 80, waterMl: 2500 };
const window = { startHour: 7, endHour: 22 };
const day = (minutes: number, eaten: Partial<DayInput["eaten"]>): DayInput => ({ goals, window, minutes, eaten: { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, ...eaten } });
const meal = (id: string, hh: number, m: Partial<DayEntry>): DayEntry => ({ id, kind: "meal", name: id, kcal: 0, carbs: 0, protein: 0, fat: 0, at: Date.UTC(2026, 10, 4, hh), source: "button", estimate: false, ingredients: [], ...m });
const water = (id: string, hh: number, ml: number): DayEntry => ({ ...meal(id, hh, {}), kind: "water", ml });

// EX-01m6m4349m8hepns4mjyz1at22 (Half of the protein goal fills half of the protein third), BR-01m6m432cqp8fkhggthg8a6720.
test("half of the protein goal fills half of the third's area, in a layer per entry", () => {
  const entries = [meal("b", 7, { protein: 17 }), meal("e", 9, { protein: 13 }), meal("l", 13, { protein: 38 }), meal("t", 16, { protein: 12 })];
  const part = partOf(day(17 * 60, { protein: 80 }), entries, "p");
  assert.equal(part.layers.length, 4);
  assert.equal(part.fill, 0.5);
  const r0 = 0, R = 100;
  const r = radiusAt(part.fill, r0, R);
  assert.ok(Math.abs(r - 70.7) < 0.1, String(r));                       // about 71 percent of the radius
  assert.ok(Math.abs((r * r) / (R * R) - 0.5) < 1e-9);                   // and exactly half of the area
  const r0b = 30, rb = radiusAt(0.5, r0b, R);
  assert.ok(Math.abs((rb * rb - r0b * r0b) / (R * R - r0b * r0b) - 0.5) < 1e-9);  // with a hub too
});

test("a layer holds only its own entry, in time order, and the rest of the server's total is one more layer", () => {
  const entries = [meal("l", 13, { protein: 38 }), meal("b", 7, { protein: 17 }), water("w", 9, 250), meal("c", 10, { protein: 0 })];
  const layers = layersOf(entries, "p", 80, 160);
  assert.deepEqual(layers.map((l) => l.id), ["b", "l", "rest"]);
  assert.equal(layers[0]!.from, 0);
  assert.equal(layers[1]!.to, 55 / 160);
  assert.equal(layers[2]!.to, 0.5);
});

// EX-01m6m432r02t0w6ex4nb3ga68e (Fat over the cap spills onto the rim of the plate).
test("fat above the cap spills onto the rim, and fat near the cap is tight", () => {
  const over = partOf(day(21 * 60, { fat: 83 }), [], "f");
  assert.equal(over.limit, true);
  assert.ok(Math.abs(over.over - 3 / 80) < 1e-9);
  const R = 99, ro = spillRadius(over.over, 35, R, R + 7, R + 13);
  assert.ok(ro >= R + 7 && ro <= R + 13, String(ro));
  assert.equal(spillRadius(0, 35, R, R + 7, R + 13), R);
  // EX-01m3y1ptc4mfsg0c8vbcjm3w2z (The fat third shows the cap): 72 of 80 g is 90 percent of the area, tight, not over.
  const near = partOf(day(17 * 60 + 40, { fat: 72 }), [], "f");
  assert.deepEqual([near.tight, near.over, near.behind], [true, 0, false]);
  assert.equal(near.fill, 0.9);
});

// EX-01m6m4340zqfxmgcdad670w4h9 (Water fills the glass in blue, hatched where it lags).
test("the glass holds a layer per glass and lags behind the plan line at 13:00", () => {
  const glass = partOf(day(13 * 60, { waterMl: 500 }), [water("a", 9, 250), water("b", 11, 250), meal("x", 10, { protein: 5 })], "w");
  assert.equal(glass.layers.length, 2);
  assert.equal(glass.fill, 0.2);
  assert.ok(Math.abs(glass.plan * 2500 - 1000) < 1, String(glass.plan * 2500));  // the plan line stands at about 1.0 l
  assert.equal(glass.behind, true);
});

test("a minimum reached is done, and the dot of an entry is its main macro by calories", () => {
  assert.equal(partOf(day(15 * 60, { carbs: 190 }), [], "c").done, true);
  assert.equal(mainOf(meal("eggs", 8, { protein: 13, carbs: 1, fat: 11 })), "f");
  assert.equal(mainOf(meal("chicken", 13, { protein: 38, carbs: 62, fat: 9 })), "c");
  assert.equal(mainOf(meal("curd", 18, { protein: 28, carbs: 10, fat: 5 })), "p");
  assert.equal(mainOf(water("w", 9, 250)), "w");
});

// EX-01m3y1pt5w7j5jqnjppct4gntd (Tapping the chosen third again goes back to the calories).
test("a tap chooses a third, and a second tap on it or the centre goes back to the calories", async () => {
  const { nextShown } = await import("./plate.ts");
  assert.equal(nextShown("kcal", "p"), "p");
  assert.equal(nextShown("p", "p"), "kcal");
  assert.equal(nextShown("p", "kcal"), "kcal");
  assert.equal(nextShown("p", "w"), "w");
});

// EX-01m3y1pve0wkbm75jfke81r9ve (A logged meal appears among today's entries in time order): a coffee from the Claude connector
// is one more layer in its place in time, and the plate counts it once.
test("an entry from Google Health only is a layer in its place, counted once", () => {
  const coffee = { ...meal("coffee", 10, { carbs: 7 }), source: "google" as const };
  const layers = layersOf([meal("lunch", 13, { carbs: 62 }), coffee, meal("breakfast", 7, { carbs: 72 })], "c", 141, 185);
  assert.deepEqual(layers.map((l) => l.id), ["breakfast", "coffee", "lunch"]);
  assert.ok(Math.abs(layers[2]!.to - 141 / 185) < 1e-9);
});

// BR-01m6m432cqp8fkhggthg8a6720 (Each third of the plate fills with its own food, one portion per entry).
const GEO = { cx: 120, cy: 120, r: 99, hub: 30 };
// EX-01m6m4349m8hepns4mjyz1at22 (Half of the protein goal fills half of the protein third).
test("half of the protein goal covers half of the lentil spots, from the middle outwards, a shade per entry", async () => {
  const { spotsOf, spillSpotsOf, grainsOf } = await import("./plate.ts");
  const entries = [meal("b", 7, { protein: 17 }), meal("e", 9, { protein: 13 }), meal("l", 13, { protein: 38 }), meal("t", 16, { protein: 12 })];
  const part = partOf(day(17 * 60, { protein: 80 }), entries, "p");
  const spots = spotsOf("p", GEO);
  const grains = grainsOf(part, spots, (n) => spillSpotsOf("p", GEO, n));
  assert.equal(grains.length, Math.round(spots.length / 2));
  assert.deepEqual([...new Set(grains.map((g) => g.entry))], ["b", "e", "l", "t"]);
  assert.deepEqual(grains.slice(0, 3).map((g) => g.shade), [0, 0, 0]);
  assert.equal(grains.every((g) => !g.spilled), true);
  const lastNear = Math.max(...grains.map((g) => g.d)), firstFar = Math.min(...spots.slice(grains.length).map((s) => s.d));
  assert.ok(lastNear <= firstFar, "the grains fill from the middle");
});

// EX-01m6nzdzhdf1nz6r7t99vznk9w (Rice over the carb goal spills onto the rim and the table).
test("rice above the carb goal spills onto the rim, the more the further over, and never beyond the cap", async () => {
  const { spotsOf, spillSpotsOf, grainsOf, MAX_SPILL } = await import("./plate.ts");
  const spots = spotsOf("c", GEO);
  const over = grainsOf(partOf(day(17 * 60, { carbs: 300 }), [meal("x", 9, { carbs: 300 })], "c"), spots, (n) => spillSpotsOf("c", GEO, n));
  const spilled = over.filter((g) => g.spilled);
  assert.equal(over.length - spilled.length, spots.length);
  assert.equal(spilled.length, Math.min(MAX_SPILL, Math.round((115 / 185) * spots.length)));
  assert.ok(spilled.every((g) => Math.hypot(g.x - GEO.cx, g.y - GEO.cy) > GEO.r), "on the rim, outside the well");
  const little = grainsOf(partOf(day(17 * 60, { carbs: 190 }), [meal("x", 9, { carbs: 190 })], "c"), spots, (n) => spillSpotsOf("c", GEO, n));
  assert.ok(little.filter((g) => g.spilled).length < spilled.length);
});

// EX-01m6nze05k4np1swbj179esg8j (Each third holds its own food): each third has its own spots, inside it.
test("each third has its own spots, inside its own sector, and the grains of the three differ in spacing", async () => {
  const { spotsOf, THIRD_ANGLE } = await import("./plate.ts");
  for (const t of ["p", "c", "f"] as const) {
    const s = spotsOf(t, GEO);
    assert.ok(s.length > 100, `${t}: ${s.length}`);
    assert.ok(s.every((p) => Math.abs((((Math.atan2(p.y - 120, p.x - 120) * 180) / Math.PI - THIRD_ANGLE[t] + 540) % 360) - 180) < 60));
  }
  assert.ok(spotsOf("p", GEO).length > spotsOf("c", GEO).length && spotsOf("c", GEO).length > spotsOf("f", GEO).length);
});

// EX-01m6py99we6df5kcy1cnqvbd6g (The glass shows its litres under it).
test("the glass reads its litres", () => {
  assert.equal(glassText(500, 2000), "0,5 / 2,0 l");
  assert.equal(glassText(0, 2500), "0,0 / 2,5 l");
});
