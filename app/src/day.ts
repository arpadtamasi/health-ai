// US-01m3rvr64zrzczabckjf6crb2z (See where I am against the day's pace), US-01m3y1prd5e73v389tvmmk9nm7 (Choose what the home
// shows) and BR-01m6m4323nzt0ma6qf6j5a0yxa (Each macro has its own colour, and words state the situation): how the day stands
// against its plan, which the line under the plate says. Pure functions, so the rules can be tested; plate.ts draws the thirds.
import { dayFraction, type Window } from "./pace.ts";

export type Metric = "kcal" | "p" | "c" | "f" | "w";
export type Tone = "ok" | "behind" | "done";

export interface Goals { calories: number; carbs: number; protein: number; fat: number; waterMl: number }
export interface Eaten { calories: number; carbs: number; protein: number; fat: number; waterMl: number }

/** One logged meal or drink of today (the server's /entries/today). */
export interface DayEntry {
  id: string;
  kind: "meal" | "water";
  name: string;
  kcal: number; carbs: number; protein: number; fat: number;
  ml?: number;
  at: number;
  mealType?: string;
  source: "photo" | "typed" | "button" | "chat" | "google";
  estimate: boolean;
  ingredients: string[];
}

export interface DayInput {
  goals: Goals;
  eaten: Eaten;
  minutes: number;
  window: Window;
}

/** Calories are more than this far under the plan before the line says "under the plan" (BR-01m6m4323nzt0ma6qf6j5a0yxa). */
export const BEHIND_KCAL = 120;
/** For a macro or water the same threshold is a share of its goal. */
export const BEHIND_SHARE = 0.08;

export const METRIC_GOAL = (g: Goals, m: Metric): number => ({ kcal: g.calories, p: g.protein, c: g.carbs, f: g.fat, w: g.waterMl })[m];
export const METRIC_EATEN = (e: Eaten, m: Metric): number => ({ kcal: e.calories, p: e.protein, c: e.carbs, f: e.fat, w: e.waterMl })[m];

export type HeroKind = "morning" | "start" | "under" | "ahead" | "on" | "done" | "fatLeft" | "fatOver";
export interface Hero {
  tone: Tone;
  kind: HeroKind;
  metric: Metric;
  /** The figure the headline carries: kcal, grams or millilitres, rounded for reading. */
  amount: number;
  /** A second sentence: which other number needs attention. */
  note?: { kind: "fatLeft" | "proteinBehind"; amount: number };
}

const round10 = (n: number) => Math.round(n / 10) * 10;
const hasMeals = (entries: DayEntry[]) => entries.some((e) => e.kind === "meal");

/** The metric the person wants to see, judged against the plan for this time of day. */
export function judgeHero(d: DayInput, entries: DayEntry[], metric: Metric = "kcal"): Hero {
  const goal = METRIC_GOAL(d.goals, metric);
  const have = METRIC_EATEN(d.eaten, metric);
  const planNow = goal * dayFraction(d.minutes, d.window);
  const diff = have - planNow;
  const fatLeft = d.goals.fat - d.eaten.fat;
  const proteinBehind = d.goals.protein - d.eaten.protein;
  const lagging = proteinBehind > 25 && d.eaten.protein / d.goals.protein < dayFraction(d.minutes, d.window) - 0.08;
  const note: Hero["note"] = fatLeft <= 12 ? { kind: "fatLeft", amount: Math.max(0, fatLeft) } : lagging ? { kind: "proteinBehind", amount: proteinBehind } : undefined as never;
  const withNote = (h: Hero): Hero => (metric === "kcal" && note ? { ...h, note } : h);

  if (metric === "f") return { tone: have > goal ? "behind" : "ok", kind: have > goal ? "fatOver" : "fatLeft", metric, amount: Math.abs(goal - have) };
  if (metric === "kcal" && (d.minutes >= d.window.endHour * 60 || have >= goal)) return withNote({ tone: "done", kind: "done", metric, amount: proteinBehind > 0 ? proteinBehind : 0 });
  if (metric === "kcal") {
    if (!hasMeals(entries)) return { tone: "ok", kind: "morning", metric, amount: goal };
    if (d.minutes < (d.window.startHour + 2) * 60) return withNote({ tone: "ok", kind: "start", metric, amount: d.eaten.protein });
    if (diff < -BEHIND_KCAL) return withNote({ tone: "behind", kind: "under", metric, amount: round10(-diff) });
    if (diff > BEHIND_KCAL) return withNote({ tone: "ok", kind: "ahead", metric, amount: round10(diff) });
    return withNote({ tone: "ok", kind: "on", metric, amount: 0 });
  }
  const limit = BEHIND_SHARE * goal;
  if (diff < -limit) return { tone: "behind", kind: "under", metric, amount: Math.round(-diff) };
  if (diff > limit) return { tone: "ok", kind: "ahead", metric, amount: Math.round(diff) };
  return { tone: "ok", kind: "on", metric, amount: Math.round(have) };
}

/** Minutes since local midnight of an instant, in the person's time zone. */
export function minutesOf(at: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(at));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  return get("hour") * 60 + get("minute");
}
