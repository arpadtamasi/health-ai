// US-01m3rvr64zrzczabckjf6crb2z (pace): what has been eaten so far today, from the nutrition log written through this service.
import { HealthApi } from "../health/api.js";
import { findDataType } from "../health/registry.js";
import { listFilter, parseRange } from "../health/time.js";
import type { Macros } from "../ai/types.js";

export interface LocalClock {
  /** `YYYY-MM-DD` in the user's time zone. */
  date: string;
  minutes: number;
}

export function localClock(nowMs: number, timeZone: string): LocalClock {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(nowMs));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nextDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
const obj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});

/** Calories, carbs and protein summed over nutrition-log data points. */
export function sumNutrition(points: unknown[]): Macros {
  const total = { calories: 0, carbs: 0, protein: 0, fat: 0 };
  for (const p of points) {
    const n = obj(obj(p)["nutritionLog"]);
    total.calories += num(obj(n["energy"])["kcal"]);
    total.carbs += num(obj(n["totalCarbohydrate"])["grams"]);
    total.fat += num(obj(n["totalFat"])["grams"]);
    const nutrients = Array.isArray(n["nutrients"]) ? n["nutrients"] : [];
    for (const item of nutrients) {
      const o = obj(item);
      if (o["nutrient"] === "PROTEIN") total.protein += num(obj(o["quantity"])["grams"]);
    }
  }
  return { calories: Math.round(total.calories), carbs: Math.round(total.carbs), protein: Math.round(total.protein), fat: Math.round(total.fat) };
}

/** Millilitres drunk, summed over hydration-log data points. */
export function sumHydration(points: unknown[]): number {
  let ml = 0;
  for (const p of points) ml += num(obj(obj(obj(p)["hydrationLog"])["amountConsumed"])["milliliters"]);
  return Math.round(ml);
}

/** The data points of one Google Health type for the local days [from, to), paged. */
export async function listGooglePoints(api: HealthApi, typeId: string, from: string, to: string): Promise<Record<string, unknown>[]> {
  const type = findDataType(typeId);
  if (!type) throw new Error(`${typeId} is missing from the registry`);
  const range = parseRange(from, to);
  if ("error" in range) throw new Error(range.error);
  const filter = listFilter(type, range);
  if (typeof filter !== "string") throw new Error(filter.error);
  const points: Record<string, unknown>[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 10; page++) {
    const res = await api.listDataPoints(type.id, { filter, pageSize: 100, ...(pageToken ? { pageToken } : {}) });
    if (Array.isArray(res["dataPoints"])) points.push(...(res["dataPoints"] as Record<string, unknown>[]));
    pageToken = typeof res["nextPageToken"] === "string" && res["nextPageToken"] ? res["nextPageToken"] : undefined;
    if (!pageToken) break;
  }
  return points;
}

/** Start of the local day (and of the next one) in epoch milliseconds, for a time zone. */
export function dayBounds(nowMs: number, timeZone: string): { from: number; to: number } {
  const { date } = localClock(nowMs, timeZone);
  const at = (d: string) => {
    const guess = Date.parse(`${d}T00:00:00Z`);
    // The offset at local midnight, found by correcting the guess once (it can differ from the offset at the guess itself).
    const first = guess - utcOffsetSeconds(guess, timeZone) * 1000;
    return guess - utcOffsetSeconds(first, timeZone) * 1000;
  };
  return { from: at(date), to: at(nextDate(date)) };
}

/** The user's UTC offset in seconds at an instant, from their time zone (what the Health API wants as "7200s"). */
export function utcOffsetSeconds(nowMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(nowMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(nowMs / 1000) * 1000) / 1000);
}

export function mealTypeAt(minutes: number): "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER" {
  if (minutes < 10 * 60 + 30) return "BREAKFAST";
  if (minutes < 15 * 60) return "LUNCH";
  if (minutes < 18 * 60) return "SNACK";
  return "DINNER";
}
