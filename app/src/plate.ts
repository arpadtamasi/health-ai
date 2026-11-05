// BR-01m6m432cqp8fkhggthg8a6720 (The plate fills each third by area, one layer per entry) and US-01m3rvr64zrzczabckjf6crb2z (See
// where I am against the day's pace): what the plate and the glass draw. Pure functions, so the rules can be tested; Plate.tsx and
// Glass.tsx only draw what these return.
import { dayFraction } from "./pace.ts";
import type { DayEntry, DayInput } from "./day.ts";

export type Third = "p" | "c" | "f";
export type Drawn = Third | "w";

/** One entry's share of a goal: from and to are fractions of the goal (0..1, more for fat above the cap). */
export interface Layer { id: string; from: number; to: number }

export interface Part {
  metric: Drawn;
  goal: number;
  eaten: number;
  /** eaten / goal, not capped. */
  fill: number;
  /** Where the plan stands now, 0..1 of the goal. */
  plan: number;
  layers: Layer[];
  /** A minimum more than eight points under the plan: the gap is hatched. */
  behind: boolean;
  /** A minimum reached: the plan mark is no longer drawn. */
  done: boolean;
  /** Fat is a cap: its rim is drawn thick and what is above it spills onto the rim of the plate. */
  limit: boolean;
  /** How far over the cap, as a fraction of the goal (0 when under). */
  over: number;
  /** At least 85 percent of the cap is used. */
  tight: boolean;
}

const GOAL = { p: (d: DayInput) => d.goals.protein, c: (d: DayInput) => d.goals.carbs, f: (d: DayInput) => d.goals.fat, w: (d: DayInput) => d.goals.waterMl };
const EATEN = { p: (d: DayInput) => d.eaten.protein, c: (d: DayInput) => d.eaten.carbs, f: (d: DayInput) => d.eaten.fat, w: (d: DayInput) => d.eaten.waterMl };
const VALUE = { p: (e: DayEntry) => e.protein, c: (e: DayEntry) => e.carbs, f: (e: DayEntry) => e.fat, w: (e: DayEntry) => e.ml ?? 0 };

/**
 * A layer for each entry with some of the metric, in time order. The day's total is the server's; when the entries do not add up to
 * it (an entry the list does not have yet), the difference is one more layer, so that the plate never shows less than the total.
 */
export function layersOf(entries: DayEntry[], metric: Drawn, total: number, goal: number): Layer[] {
  if (goal <= 0) return [];
  const out: Layer[] = [];
  let run = 0;
  for (const e of [...entries].sort((a, b) => a.at - b.at)) {
    if ((metric === "w") !== (e.kind === "water")) continue;
    const v = VALUE[metric](e);
    if (v <= 0) continue;
    out.push({ id: e.id, from: run / goal, to: (run + v) / goal });
    run += v;
  }
  if (total - run > 0.5) out.push({ id: "rest", from: run / goal, to: total / goal });
  return out;
}

export function partOf(d: DayInput, entries: DayEntry[], metric: Drawn): Part {
  const goal = GOAL[metric](d), eaten = EATEN[metric](d), limit = metric === "f";
  const fill = goal > 0 ? eaten / goal : 0;
  const plan = dayFraction(d.minutes, d.window);
  return {
    metric, goal, eaten, fill, plan, layers: layersOf(entries, metric, eaten, goal),
    behind: !limit && fill < plan - 0.08, done: !limit && eaten >= goal, limit,
    over: limit ? Math.max(0, fill - 1) : 0, tight: limit && fill >= 0.85,
  };
}

/**
 * The radius at which a third is filled to `f` of its goal, between the hub (r0) and the rim (R): the area, not the radius, grows
 * with what was eaten, so half a goal fills half the third.
 */
export function radiusAt(f: number, r0: number, R: number): number {
  const k = Math.min(1, Math.max(0, f));
  return Math.sqrt(r0 * r0 + k * (R * R - r0 * r0));
}

/** The outer radius of the spill above the cap, by the same area rule, never thinner than `min` nor beyond `max`. */
export function spillRadius(over: number, r0: number, R: number, min: number, max: number): number {
  if (over <= 0) return R;
  return Math.max(min, Math.min(max, Math.sqrt(R * R + over * (R * R - r0 * r0))));
}

/**
 * US-01m3y1prd5e73v389tvmmk9nm7 (Choose what the home shows) and EX-01m3y1pt5w7j5jqnjppct4gntd (Tapping the chosen third again goes
 * back to the calories): a tap on a third, the glass, a figure or the centre chooses what the line and the centre show.
 */
export function nextShown(current: Drawn | "kcal", tapped: Drawn | "kcal"): Drawn | "kcal" {
  return tapped === "kcal" || tapped === current ? "kcal" : tapped;
}

/** The macro an entry is mostly made of (by its calories), for the dot of the entry: protein 4, carbs 4, fat 9 kcal a gram. */
export function mainOf(e: DayEntry): Drawn {
  if (e.kind === "water") return "w";
  const k = { p: e.protein * 4, c: e.carbs * 4, f: e.fat * 9 };
  return (Object.keys(k) as Third[]).reduce((a, b) => (k[b] > k[a] ? b : a), "c");
}

// ---- BR-01m6m432cqp8fkhggthg8a6720 (Each third of the plate fills with its own food, one portion per entry) ----

/** Where a third's grains go: a point, its distance from the middle of the third (the pour point), and a little randomness. */
export interface Spot { x: number; y: number; d: number; rot: number; j: number }
export interface Geometry { cx: number; cy: number; r: number; hub: number }
/** The middle angle of each third, in degrees (protein on top, carbs bottom right, fat bottom left). */
export const THIRD_ANGLE: Record<Third, number> = { p: -90, c: 30, f: 150 };
/** How far apart the grains sit: lentils are small and round, rice longer, pumpkin seeds the largest. */
export const GRAIN_STEP: Record<Third, number> = { p: 5.4, c: 6.2, f: 7.4 };

const seeded = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/**
 * The grain spots of one third on a hexagonal grid, ordered from its middle outwards (with a little jitter, so the edge is
 * organic), so that the first n spots are what n grains cover. Deterministic: the same third always looks the same.
 */
export function spotsOf(t: Third, g: Geometry): Spot[] {
  const a = THIRD_ANGLE[t], step = GRAIN_STEP[t], margin = 2;
  const mid = { x: g.cx + g.r * 0.5 * Math.cos((a * Math.PI) / 180), y: g.cy + g.r * 0.5 * Math.sin((a * Math.PI) / 180) };
  const rnd = seeded(Math.abs(a) * 13 + Math.round(step * 70) + 1);
  const out: Spot[] = [];
  const dy = step * 0.866;
  for (let row = 0, y = g.cy - g.r; y <= g.cy + g.r; row++, y += dy) {
    for (let x = g.cx - g.r + (row % 2) * (step / 2); x <= g.cx + g.r; x += step) {
      const d = Math.hypot(x - g.cx, y - g.cy);
      if (d > g.r - margin || d < g.hub + margin) continue;
      const ang = (Math.atan2(y - g.cy, x - g.cx) * 180) / Math.PI, off = Math.abs(((ang - a + 540) % 360) - 180);
      if (((60 - off) * Math.PI) / 180 * d < margin + 3.5) continue;
      const dist = Math.hypot(x - mid.x, y - mid.y);
      out.push({ x, y, d: dist + rnd() * step * 1.2, rot: rnd() * 180, j: rnd() });
    }
  }
  return out.sort((u, v) => u.d - v.d);
}

/**
 * Spots on the rim of the plate beside a third, nearest to its middle first, in up to three rows along the rim, for the grains above
 * the goal: they spread along the rim rather than off the picture.
 */
export function spillSpotsOf(t: Third, g: Geometry, n: number): Spot[] {
  const a = THIRD_ANGLE[t], step = GRAIN_STEP[t] + 0.4, out: Spot[] = [];
  for (let ring = 0; ring < 3 && out.length < n; ring++) {
    const r = g.r + 6 + ring * step, per = Math.floor(((100 * Math.PI) / 180) * r / step);
    for (let k = 0; k < per && out.length < n; k++) {
      const side = k % 2 ? 1 : -1, ang = a + side * Math.ceil(k / 2) * ((step / r) * 180) / Math.PI + (ring % 2) * 2;
      out.push({ x: g.cx + r * Math.cos((ang * Math.PI) / 180), y: g.cy + r * Math.sin((ang * Math.PI) / 180), d: r, rot: (out.length * 47) % 180, j: (out.length * 0.37) % 1 });
    }
  }
  return out;
}

export interface Grain extends Spot { entry: string; shade: 0 | 1; spilled: boolean }
/** The most grains that spill out of one third, so that a very large excess does not cover the screen. */
export const MAX_SPILL = 70;

/**
 * The grains of one third: each layer (an entry's share of the goal) covers the next run of spots, in a shade of its own; what lies
 * above the goal (BR-01m6nzdyz40bdbmtbn9ffze1v5) spills onto the rim and the table.
 */
export function grainsOf(part: Part, spots: Spot[], spill: (n: number) => Spot[]): Grain[] {
  const n = spots.length, out: Grain[] = [];
  const over = part.layers.reduce((m, l) => Math.max(m, l.to), 0) - 1;
  const rim = over > 0 ? spill(Math.min(MAX_SPILL, Math.round(over * n))) : [];
  part.layers.forEach((l, i) => {
    const shade = (i % 2) as 0 | 1;
    for (let k = Math.round(Math.min(1, l.from) * n); k < Math.round(Math.min(1, l.to) * n); k++) out.push({ ...spots[k]!, entry: l.id, shade, spilled: false });
    for (let k = Math.round(Math.max(0, l.from - 1) * n); k < Math.min(rim.length, Math.round(Math.max(0, l.to - 1) * n)); k++) out.push({ ...rim[k]!, entry: l.id, shade, spilled: true });
  });
  return out;
}

/** The radius around the middle of a third within which the grains of a share `f` lie: the dashed plan contour. */
export function contourOf(spots: Spot[], f: number, g: Geometry, t: Third): number {
  if (f <= 0 || !spots.length) return 0;
  const a = THIRD_ANGLE[t], mx = g.cx + g.r * 0.5 * Math.cos((a * Math.PI) / 180), my = g.cy + g.r * 0.5 * Math.sin((a * Math.PI) / 180);
  const k = Math.min(spots.length - 1, Math.round(Math.min(1, f) * spots.length));
  return Math.hypot(spots[k]!.x - mx, spots[k]!.y - my) + 2;
}
