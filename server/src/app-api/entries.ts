// US-01m3rvr6g951cs1s9p1czxvmhp (Log a meal in one step), US-01m3rvr6p4vj42j4atck7vyw08 (Log water and repeat items in one tap),
// BR "Meals and water kept by the service belong to the person": the person's meals and water live in the service's own storage
// until they delete them, and are mirrored to Google Health when it is connected. Totals read our own entries and, for a connected
// person, add what was logged in Google Health by other means (the Claude connector) and is not our own copy.
import { randomUUID } from "node:crypto";
import type { Macros } from "../ai/types.js";
import type { HealthApi } from "../health/api.js";
import type { Entry, Store } from "../store/types.js";
import { mealTypeFor, mirrorMeal, mirrorWater, removeMirror } from "./meal.js";
import { dayBounds, listGooglePoints, localClock, nextDate, sumHydration, sumNutrition, addDays, type LocalClock } from "./today.js";

export interface EntriesDeps {
  store: Store;
  userId: string;
  now: () => number;
  /** Present only when the person has connected Google Health. */
  health?: HealthApi | undefined;
}

export interface MealInput { name: string; kcal: number; carbs: number; protein: number; ingredients?: string[]; source: Entry["source"]; estimate?: boolean }

export interface DayData {
  eaten: Macros;
  waterMl: number;
  clock: LocalClock;
  timeZone: string;
}

export interface Usual { kind: "meal" | "water"; name: string; kcal: number; carbs: number; protein: number; ml?: number; count: number }

const mealRef = (p: Record<string, unknown>) => (typeof p["name"] === "string" ? p["name"] : "");

export class Entries {
  constructor(private readonly d: EntriesDeps) {}

  /** The device's time zone when it told us, else Google's setting (when connected), else UTC. */
  async timeZone(): Promise<string> {
    const prefs = await this.d.store.getAppPrefs(this.d.userId);
    if (prefs?.timeZone) return prefs.timeZone;
    if (this.d.health) {
      try {
        const raw = (await this.d.health.getSettings())["timeZone"];
        if (typeof raw === "string" && raw) return raw;
      } catch { /* fall through to UTC */ }
    }
    return "UTC";
  }

  async logMeal(m: MealInput): Promise<{ id: string; mealType: string }> {
    const at = this.d.now();
    const entry: Entry = {
      id: randomUUID(), userId: this.d.userId, kind: "meal", name: m.name.trim(),
      kcal: Math.round(m.kcal), carbs: Math.round(m.carbs), protein: Math.round(m.protein),
      ingredients: m.ingredients ?? [], source: m.source, estimate: m.estimate ?? m.source !== "button", at,
    };
    const tz = await this.timeZone();
    await this.d.store.putEntry(entry);
    await this.mirror(entry, tz, mirrorMeal);
    return { id: entry.id, mealType: mealTypeFor(at, tz) };
  }

  async logWater(ml: number, source: Entry["source"] = "button"): Promise<{ id: string }> {
    const entry: Entry = {
      id: randomUUID(), userId: this.d.userId, kind: "water", name: "Water", kcal: 0, carbs: 0, protein: 0, ml: Math.round(ml),
      ingredients: [], source, estimate: false, at: this.d.now(),
    };
    await this.d.store.putEntry(entry);
    await this.mirror(entry, await this.timeZone(), mirrorWater);
    return { id: entry.id };
  }

  /** The Google Health copy is best effort: the entry is ours first, and a failed copy never loses it. */
  private async mirror(entry: Entry, tz: string, write: (api: HealthApi, e: Entry, tz: string) => Promise<string | undefined>): Promise<void> {
    if (!this.d.health) return;
    try {
      const googleName = await write(this.d.health, entry, tz);
      if (googleName) await this.d.store.putEntry({ ...entry, googleName });
    } catch { /* the entry stays ours only */ }
  }

  async day(): Promise<DayData> {
    const timeZone = await this.timeZone();
    const nowMs = this.d.now();
    const bounds = dayBounds(nowMs, timeZone);
    const own = await this.d.store.listEntries(this.d.userId, bounds);
    const eaten = own.filter((e) => e.kind === "meal").reduce<Macros>((a, e) => ({ calories: a.calories + e.kcal, carbs: a.carbs + e.carbs, protein: a.protein + e.protein }), { calories: 0, carbs: 0, protein: 0 });
    let waterMl = own.filter((e) => e.kind === "water").reduce((a, e) => a + (e.ml ?? 0), 0);
    const clock = localClock(nowMs, timeZone);
    if (this.d.health) {
      // What Google Health holds from other writers (the Claude connector) and is not the copy of one of our own entries.
      const ours = new Set(own.map((e) => e.googleName).filter((n): n is string => !!n));
      try {
        const [meals, drinks] = await Promise.all([
          listGooglePoints(this.d.health, "nutrition-log", clock.date, nextDate(clock.date)),
          listGooglePoints(this.d.health, "hydration-log", clock.date, nextDate(clock.date)),
        ]);
        const other = sumNutrition(meals.filter((p) => !ours.has(mealRef(p))));
        eaten.calories += other.calories; eaten.carbs += other.carbs; eaten.protein += other.protein;
        waterMl += sumHydration(drinks.filter((p) => !ours.has(mealRef(p))));
      } catch { /* Google Health is unreachable or needs a reconnect: our own entries still count */ }
    }
    return { eaten: { calories: Math.round(eaten.calories), carbs: Math.round(eaten.carbs), protein: Math.round(eaten.protein) }, waterMl: Math.round(waterMl), clock, timeZone };
  }

  /** The most frequent foods and drinks of the last 30 days: meals logged at least twice, drinks at least once. */
  async usuals(days = 30): Promise<Usual[]> {
    const timeZone = await this.timeZone();
    const nowMs = this.d.now();
    const today = localClock(nowMs, timeZone).date;
    const from = dayBounds(Date.parse(`${addDays(today, -days)}T12:00:00Z`), timeZone).from;
    const to = dayBounds(nowMs, timeZone).to;
    const own = await this.d.store.listEntries(this.d.userId, { from, to });
    const groups = new Map<string, { u: Usual; sum: { kcal: number; carbs: number; protein: number } }>();
    const add = (key: string, base: Omit<Usual, "count" | "kcal" | "carbs" | "protein">, v: { kcal: number; carbs: number; protein: number }) => {
      const g = groups.get(key) ?? { u: { ...base, kcal: 0, carbs: 0, protein: 0, count: 0 }, sum: { kcal: 0, carbs: 0, protein: 0 } };
      g.u.count += 1; g.sum.kcal += v.kcal; g.sum.carbs += v.carbs; g.sum.protein += v.protein;
      groups.set(key, g);
    };
    for (const e of own) {
      if (e.kind === "water") add(`water:${e.ml}`, { kind: "water", name: `${e.ml} ml`, ...(e.ml !== undefined ? { ml: e.ml } : {}) }, { kcal: 0, carbs: 0, protein: 0 });
      else add(`meal:${e.name.toLowerCase()}`, { kind: "meal", name: e.name }, e);
    }
    if (this.d.health) {
      // The person's older entries live in Google Health only (they were logged before the service kept its own): count them too.
      try {
        const ours = new Set(own.map((e) => e.googleName).filter((n): n is string => !!n));
        const points = (await listGooglePoints(this.d.health, "nutrition-log", addDays(today, -days), nextDate(today))).filter((p) => !ours.has(mealRef(p)));
        for (const p of points) {
          const n = (p["nutritionLog"] ?? {}) as Record<string, unknown>;
          const name = typeof n["foodDisplayName"] === "string" ? n["foodDisplayName"].trim() : "";
          if (!name) continue;
          const m = sumNutrition([p]);
          add(`meal:${name.toLowerCase()}`, { kind: "meal", name }, { kcal: m.calories, carbs: m.carbs, protein: m.protein });
        }
      } catch { /* the buttons are a convenience */ }
    }
    return [...groups.values()]
      .filter(({ u }) => (u.kind === "water" ? u.count >= 1 : u.count >= 2))
      .sort((a, b) => b.u.count - a.u.count || a.u.name.localeCompare(b.u.name))
      .slice(0, 6)
      .map(({ u, sum }) => ({ ...u, kcal: Math.round(sum.kcal / u.count), carbs: Math.round(sum.carbs / u.count), protein: Math.round(sum.protein / u.count) }));
  }

  /** The latest entries (the last 7 days, newest first), for the chat to find what a person means by "the apple from yesterday". */
  async recent(limit = 20): Promise<Entry[]> {
    const nowMs = this.d.now();
    const tz = await this.timeZone();
    const from = dayBounds(Date.parse(`${addDays(localClock(nowMs, tz).date, -7)}T12:00:00Z`), tz).from;
    return (await this.d.store.listEntries(this.d.userId, { from, to: nowMs + 60_000 })).reverse().slice(0, limit);
  }

  /** Deletes entries by our id (or, for old ones, by their Google name) and their Google Health copies. Returns how many went. */
  async remove(ids: string[]): Promise<number> {
    let n = 0;
    for (const id of ids) {
      const e = await this.d.store.getEntry(this.d.userId, id);
      if (!e) {
        // An entry logged before the service kept its own: the id is its Google resource name.
        if (this.d.health && /^users\//.test(id)) { try { await removeMirror(this.d.health, id); n++; } catch { /* already gone */ } }
        continue;
      }
      await this.d.store.deleteEntry(this.d.userId, id);
      if (e.googleName && this.d.health) { try { await removeMirror(this.d.health, e.googleName); } catch { /* the Google copy is the person's to manage */ } }
      n++;
    }
    return n;
  }

  /** Deletes the whole history. The Google Health copies stay: they are the person's to manage in Google Health. */
  async removeAll(): Promise<number> {
    return (await this.d.store.deleteAllEntries(this.d.userId)).length;
  }
}
