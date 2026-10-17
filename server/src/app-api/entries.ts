// US-01m3rvr6g951cs1s9p1czxvmhp (Log a meal in one step), US-01m3rvr6p4vj42j4atck7vyw08 (Log water and repeat items in one tap),
// BR "Meals and water kept by the service belong to the person": the person's meals and water live in the service's own storage
// until they delete them, and are mirrored to Google Health when it is connected. Totals read our own entries and, for a connected
// person, add what was logged in Google Health by other means (the Claude connector) and is not our own copy.
import { randomUUID } from "node:crypto";
import type { Macros } from "../ai/types.js";
import type { HealthApi } from "../health/api.js";
import type { Entry, Store } from "../store/types.js";
import { mealTypeFor, mirrorMeal, mirrorWater, removeMirror } from "./meal.js";
import { dayBounds, listGooglePoints, localClock, nextDate, sumHydration, sumNutrition, addDays, utcOffsetSeconds, type LocalClock } from "./today.js";

export interface EntriesDeps {
  store: Store;
  userId: string;
  now: () => number;
  /** Present only when the person has connected Google Health. */
  health?: HealthApi | undefined;
}

export interface MealInput { name: string; kcal: number; carbs: number; protein: number; fat?: number | undefined; ingredients?: string[] | undefined; source: Entry["source"]; estimate?: boolean }

export interface DayData {
  eaten: Macros;
  waterMl: number;
  clock: LocalClock;
  timeZone: string;
}

export interface Usual { kind: "meal" | "water"; name: string; kcal: number; carbs: number; protein: number; fat: number; ml?: number; count: number }

/** One line of today's thread: our own entry, or one that only Google Health holds (the Claude connector wrote it). */
export interface DayEntry { id: string; kind: "meal" | "water"; name: string; kcal: number; carbs: number; protein: number; fat: number; ml?: number; at: number; mealType?: string; source: Entry["source"] | "google"; estimate: boolean; ingredients: string[] }

/** What can be changed in a logged meal. `time` is HH:MM on the entry's own day, in the person's time zone. */
export interface EntryPatch { name?: string | undefined; kcal?: number | undefined; carbs?: number | undefined; protein?: number | undefined; fat?: number | undefined; ingredients?: string[] | undefined; time?: string | undefined; mealType?: NonNullable<Entry["mealType"]> | undefined }

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
      kcal: Math.round(m.kcal), carbs: Math.round(m.carbs), protein: Math.round(m.protein), fat: Math.round(m.fat ?? 0),
      ingredients: m.ingredients ?? [], source: m.source, estimate: m.estimate ?? m.source !== "button", at,
    };
    const tz = await this.timeZone();
    await this.d.store.putEntry(entry);
    await this.mirror(entry, tz, mirrorMeal);
    return { id: entry.id, mealType: mealTypeFor(at, tz) };
  }

  async logWater(ml: number, source: Entry["source"] = "button"): Promise<{ id: string }> {
    const entry: Entry = {
      id: randomUUID(), userId: this.d.userId, kind: "water", name: "Water", kcal: 0, carbs: 0, protein: 0, fat: 0, ml: Math.round(ml),
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
    const eaten = own.filter((e) => e.kind === "meal").reduce<Required<Macros>>((a, e) => ({ calories: a.calories + e.kcal, carbs: a.carbs + e.carbs, protein: a.protein + e.protein, fat: a.fat + (e.fat ?? 0) }), { calories: 0, carbs: 0, protein: 0, fat: 0 });
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
        eaten.calories += other.calories; eaten.carbs += other.carbs; eaten.protein += other.protein; eaten.fat += other.fat ?? 0;
        waterMl += sumHydration(drinks.filter((p) => !ours.has(mealRef(p))));
      } catch { /* Google Health is unreachable or needs a reconnect: our own entries still count */ }
    }
    return { eaten: { calories: Math.round(eaten.calories), carbs: Math.round(eaten.carbs), protein: Math.round(eaten.protein), fat: Math.round(eaten.fat) }, waterMl: Math.round(waterMl), clock, timeZone };
  }

  /** The most frequent foods and drinks of the last 30 days: meals logged at least twice, drinks at least once. */
  async usuals(days = 30): Promise<Usual[]> {
    const timeZone = await this.timeZone();
    const nowMs = this.d.now();
    const today = localClock(nowMs, timeZone).date;
    const from = dayBounds(Date.parse(`${addDays(today, -days)}T12:00:00Z`), timeZone).from;
    const to = dayBounds(nowMs, timeZone).to;
    const own = await this.d.store.listEntries(this.d.userId, { from, to });
    const groups = new Map<string, { u: Usual; sum: { kcal: number; carbs: number; protein: number; fat: number } }>();
    const add = (key: string, base: Omit<Usual, "count" | "kcal" | "carbs" | "protein" | "fat">, v: { kcal: number; carbs: number; protein: number; fat?: number }) => {
      const g = groups.get(key) ?? { u: { ...base, kcal: 0, carbs: 0, protein: 0, fat: 0, count: 0 }, sum: { kcal: 0, carbs: 0, protein: 0, fat: 0 } };
      g.u.count += 1; g.sum.kcal += v.kcal; g.sum.carbs += v.carbs; g.sum.protein += v.protein; g.sum.fat += v.fat ?? 0;
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
          add(`meal:${name.toLowerCase()}`, { kind: "meal", name }, { kcal: m.calories, carbs: m.carbs, protein: m.protein, fat: m.fat ?? 0 });
        }
      } catch { /* the buttons are a convenience */ }
    }
    return [...groups.values()]
      .filter(({ u }) => (u.kind === "water" ? u.count >= 1 : u.count >= 2))
      .sort((a, b) => b.u.count - a.u.count || a.u.name.localeCompare(b.u.name))
      .slice(0, 6)
      .map(({ u, sum }) => ({ ...u, kcal: Math.round(sum.kcal / u.count), carbs: Math.round(sum.carbs / u.count), protein: Math.round(sum.protein / u.count), fat: Math.round(sum.fat / u.count) }));
  }

  /** Everything logged today, oldest first: our own entries and, for a connected person, what only Google Health holds. */
  async today(): Promise<DayEntry[]> {
    const timeZone = await this.timeZone();
    const nowMs = this.d.now();
    const bounds = dayBounds(nowMs, timeZone);
    const own = await this.d.store.listEntries(this.d.userId, bounds);
    const list: DayEntry[] = own.map((e) => ({
      id: e.id, kind: e.kind, name: e.kind === "water" ? "Water" : e.name, kcal: e.kcal, carbs: e.carbs, protein: e.protein, fat: e.fat ?? 0,
      ...(e.ml !== undefined ? { ml: e.ml } : {}), at: e.at, mealType: e.mealType ?? mealTypeFor(e.at, timeZone), source: e.source, estimate: e.estimate, ingredients: e.ingredients,
    }));
    if (this.d.health) {
      const clock = localClock(nowMs, timeZone);
      const ours = new Set(own.map((e) => e.googleName).filter((n): n is string => !!n));
      try {
        const [meals, drinks] = await Promise.all([
          listGooglePoints(this.d.health, "nutrition-log", clock.date, nextDate(clock.date)),
          listGooglePoints(this.d.health, "hydration-log", clock.date, nextDate(clock.date)),
        ]);
        for (const p of meals.filter((q) => !ours.has(mealRef(q)))) {
          const n = (p["nutritionLog"] ?? {}) as Record<string, unknown>;
          const m = sumNutrition([p]);
          const start = ((n["interval"] ?? {}) as Record<string, unknown>)["startTime"];
          const at = typeof start === "string" && Date.parse(start) ? Date.parse(start) : nowMs;
          list.push({ id: mealRef(p), kind: "meal", name: typeof n["foodDisplayName"] === "string" && n["foodDisplayName"] ? n["foodDisplayName"] : "Meal", kcal: m.calories, carbs: m.carbs, protein: m.protein, fat: m.fat ?? 0, at, source: "google", estimate: false, ingredients: [] });
        }
        for (const p of drinks.filter((q) => !ours.has(mealRef(q)))) {
          const h = (p["hydrationLog"] ?? {}) as Record<string, unknown>;
          const start = ((h["interval"] ?? {}) as Record<string, unknown>)["startTime"];
          list.push({ id: mealRef(p), kind: "water", name: "Water", kcal: 0, carbs: 0, protein: 0, fat: 0, ml: sumHydration([p]), at: typeof start === "string" && Date.parse(start) ? Date.parse(start) : nowMs, source: "google", estimate: false, ingredients: [] });
        }
      } catch { /* Google Health is unreachable: our own entries are shown */ }
    }
    return list.sort((a, b) => a.at - b.at);
  }

  /**
   * Changes an entry in place (BR: it stays the same entry, no second one appears). The Google Health copy cannot be edited, so it
   * is replaced: the old copy removed, a new one written.
   */
  async update(id: string, patch: EntryPatch): Promise<DayEntry | undefined> {
    const e = await this.d.store.getEntry(this.d.userId, id);
    if (!e || e.kind !== "meal") return undefined;
    const tz = await this.timeZone();
    let at = e.at;
    if (patch.time) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(patch.time);
      if (m && Number(m[1]) < 24 && Number(m[2]) < 60) {
        const day = localClock(e.at, tz).date;
        const guess = Date.parse(`${day}T${m[1]!.padStart(2, "0")}:${m[2]}:00Z`);
        at = guess - utcOffsetSeconds(guess, tz) * 1000;
      }
    }
    const next: Entry = {
      ...e,
      ...(patch.name !== undefined ? { name: patch.name.trim() || e.name } : {}),
      ...(patch.kcal !== undefined ? { kcal: Math.round(patch.kcal) } : {}),
      ...(patch.carbs !== undefined ? { carbs: Math.round(patch.carbs) } : {}),
      ...(patch.protein !== undefined ? { protein: Math.round(patch.protein) } : {}),
      ...(patch.fat !== undefined ? { fat: Math.round(patch.fat) } : {}),
      ...(patch.ingredients !== undefined ? { ingredients: patch.ingredients } : {}),
      ...(patch.mealType !== undefined ? { mealType: patch.mealType } : {}),
      at,
    };
    delete next.googleName;
    await this.d.store.putEntry(next);
    if (e.googleName && this.d.health) { try { await removeMirror(this.d.health, e.googleName); } catch { /* already gone */ } }
    await this.mirror(next, tz, mirrorMeal);
    const saved = (await this.d.store.getEntry(this.d.userId, id)) ?? next;
    return { id: saved.id, kind: "meal", name: saved.name, kcal: saved.kcal, carbs: saved.carbs, protein: saved.protein, fat: saved.fat ?? 0, at: saved.at, mealType: saved.mealType ?? mealTypeFor(saved.at, tz), source: saved.source, estimate: saved.estimate, ingredients: saved.ingredients };
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
