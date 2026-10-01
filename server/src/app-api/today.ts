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

export function nextDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
const obj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});

/** Calories, carbs and protein summed over nutrition-log data points. */
export function sumNutrition(points: unknown[]): Macros {
  const total: Macros = { calories: 0, carbs: 0, protein: 0 };
  for (const p of points) {
    const n = obj(obj(p)["nutritionLog"]);
    total.calories += num(obj(n["energy"])["kcal"]);
    total.carbs += num(obj(n["totalCarbohydrate"])["grams"]);
    const nutrients = Array.isArray(n["nutrients"]) ? n["nutrients"] : [];
    for (const item of nutrients) {
      const o = obj(item);
      if (o["nutrient"] === "PROTEIN") total.protein += num(obj(o["quantity"])["grams"]);
    }
  }
  return { calories: Math.round(total.calories), carbs: Math.round(total.carbs), protein: Math.round(total.protein) };
}

export async function loadToday(api: HealthApi, nowMs: number): Promise<{ eaten: Macros; clock: LocalClock; timeZone: string }> {
  const settings = await api.getSettings();
  const timeZone = typeof settings["timeZone"] === "string" && settings["timeZone"] ? settings["timeZone"] : "UTC";
  const clock = localClock(nowMs, timeZone);
  const type = findDataType("nutrition-log");
  if (!type) throw new Error("nutrition-log is missing from the registry");
  const range = parseRange(clock.date, nextDate(clock.date));
  if ("error" in range) throw new Error(range.error);
  const filter = listFilter(type, range);
  if (typeof filter !== "string") throw new Error(filter.error);

  const points: unknown[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 5; page++) {
    const res = await api.listDataPoints(type.id, { filter, pageSize: 100, ...(pageToken ? { pageToken } : {}) });
    if (Array.isArray(res["dataPoints"])) points.push(...res["dataPoints"]);
    pageToken = typeof res["nextPageToken"] === "string" && res["nextPageToken"] ? res["nextPageToken"] : undefined;
    if (!pageToken) break;
  }
  return { eaten: sumNutrition(points), clock, timeZone };
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
