// US-01m3rvr6g951cs1s9p1czxvmhp (Log a meal in one step): the Google Health copy of an entry, in the person's offset.
import { randomUUID } from "node:crypto";
import type { HealthApi } from "../health/api.js";
import { createdName } from "../mcp/health.js";
import type { Entry } from "../store/types.js";
import { localClock, mealTypeAt, utcOffsetSeconds } from "./today.js";

export function mealTypeFor(atMs: number, timeZone: string) {
  return mealTypeAt(localClock(atMs, timeZone).minutes);
}

/** Writes a meal to Google Health's nutrition-log and returns the resource name Google gave it. */
export async function mirrorMeal(api: HealthApi, e: Entry, timeZone: string): Promise<string | undefined> {
  const offset = `${utcOffsetSeconds(e.at, timeZone)}s`;
  const op = await api.createDataPoint("nutrition-log", {
    name: `users/me/dataTypes/nutrition-log/dataPoints/hai-${randomUUID()}`,
    nutritionLog: {
      interval: { startTime: new Date(e.at).toISOString(), endTime: new Date(e.at + 15 * 60 * 1000).toISOString(), startUtcOffset: offset, endUtcOffset: offset },
      mealType: mealTypeFor(e.at, timeZone),
      foodDisplayName: e.name,
      energy: { kcal: Math.round(e.kcal) },
      totalCarbohydrate: { grams: Math.round(e.carbs) },
      nutrients: [{ nutrient: "PROTEIN", quantity: { grams: Math.round(e.protein) } }],
    },
  });
  return createdName(op, "nutrition-log");
}

/** Writes a drink to Google Health's hydration-log. */
export async function mirrorWater(api: HealthApi, e: Entry, timeZone: string): Promise<string | undefined> {
  const offset = `${utcOffsetSeconds(e.at, timeZone)}s`;
  const op = await api.createDataPoint("hydration-log", {
    name: `users/me/dataTypes/hydration-log/dataPoints/hai-${randomUUID()}`,
    hydrationLog: {
      interval: { startTime: new Date(e.at).toISOString(), endTime: new Date(e.at + 60 * 1000).toISOString(), startUtcOffset: offset, endUtcOffset: offset },
      amountConsumed: { milliliters: Math.round(e.ml ?? 0) },
    },
  });
  return createdName(op, "hydration-log");
}

/** Removes the Google Health copy of an entry by the resource name it was given. Names always resolve to users/me. */
export async function removeMirror(api: HealthApi, googleName: string): Promise<void> {
  const m = /^users\/[^/]+\/dataTypes\/(nutrition-log|hydration-log)\/dataPoints\/([A-Za-z0-9._~-]{1,200})$/.exec(googleName);
  if (!m) return;
  await api.batchDelete(m[1]!, [`users/me/dataTypes/${m[1]}/dataPoints/${m[2]}`]);
}
