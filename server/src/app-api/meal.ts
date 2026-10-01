// US-01m3rvr6g951cs1s9p1czxvmhp (Log a meal in one step): one nutrition-log entry for a meal, written now, in the user's offset.
import { randomUUID } from "node:crypto";
import type { HealthApi } from "../health/api.js";
import { createdName } from "../mcp/health.js";
import { localClock, mealTypeAt, utcOffsetSeconds } from "./today.js";

export interface Meal { name: string; kcal: number; carbs: number; protein: number }

export async function timeZoneOf(api: HealthApi): Promise<string> {
  const raw = (await api.getSettings())["timeZone"];
  return typeof raw === "string" && raw ? raw : "UTC";
}

export async function logNutrition(api: HealthApi, nowMs: number, meal: Meal): Promise<{ id: string | null; mealType: string }> {
  const timeZone = await timeZoneOf(api);
  const offset = `${utcOffsetSeconds(nowMs, timeZone)}s`;
  const mealType = mealTypeAt(localClock(nowMs, timeZone).minutes);
  const id = `hai-${randomUUID()}`;
  const op = await api.createDataPoint("nutrition-log", {
    name: `users/me/dataTypes/nutrition-log/dataPoints/${id}`,
    nutritionLog: {
      interval: { startTime: new Date(nowMs).toISOString(), endTime: new Date(nowMs + 15 * 60 * 1000).toISOString(), startUtcOffset: offset, endUtcOffset: offset },
      mealType,
      foodDisplayName: meal.name,
      energy: { kcal: Math.round(meal.kcal) },
      totalCarbohydrate: { grams: Math.round(meal.carbs) },
      nutrients: [{ nutrient: "PROTEIN", quantity: { grams: Math.round(meal.protein) } }],
    },
  });
  return { id: createdName(op, "nutrition-log") ?? null, mealType };
}
