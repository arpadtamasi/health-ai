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
