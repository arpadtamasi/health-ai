// The tools of the chat agent, bound to one signed-in user: the app's settings, the person's own entries (mirrored to Google Health
// when connected) and the model call for suggestions.
import type { AgentEnv, Clock, SettingsPatch } from "../ai/agent.js";
import type { AiModel } from "../ai/model.js";
import type { DayState, Usage } from "../ai/types.js";
import { whatNow } from "../ai/whatNow.js";
import { DEFAULT_WATER_GOAL_ML, type AppSettings, type Store } from "../store/types.js";
import type { Entries } from "./entries.js";

export const CALORIE_RANGE = { min: 500, max: 10000 };
export const WATER_RANGE = { min: 500, max: 8000 };
export const FAT_RANGE = { min: 10, max: 400 };

/** The default fat goal: a quarter of the calories, 9 kcal per gram. */
export const fatGoal = (calories: number) => Math.round((calories * 0.25) / 9);

/** Calories to goals: about half the calories from carbs, a quarter from protein and a quarter from fat. */
export function goalsFor(calories: number, waterMl?: number, fat?: number) {
  return { calories, carbs: Math.round((calories * 0.5) / 4), protein: Math.round((calories * 0.25) / 4), fat: fat ?? fatGoal(calories), ...(waterMl !== undefined ? { waterMl } : {}) };
}

export interface AgentEnvDeps {
  store: Store;
  entries: Entries;
  model: AiModel;
  modelName: string;
  userId: string;
  now: () => number;
}

export function makeAgentEnv(d: AgentEnvDeps): AgentEnv & { extraUsage: Usage } {
  const extraUsage: Usage = { inputTokens: 0, outputTokens: 0 };
  let dayCache: Awaited<ReturnType<Entries["day"]>> | undefined;
  const day = async () => (dayCache ??= await d.entries.day());

  const stateOf = async (s: AppSettings): Promise<DayState> => {
    const t = await day();
    return {
      goals: { ...s.goals, fat: s.goals.fat ?? fatGoal(s.goals.calories) }, eaten: t.eaten, minutesNow: t.clock.minutes, window: s.window, constraints: s.constraints,
      water: { ml: t.waterMl, goalMl: s.goals.waterMl ?? DEFAULT_WATER_GOAL_ML },
    };
  };

  return {
    extraUsage,

    async clock(): Promise<Clock> {
      const t = await day();
      const weekday = new Intl.DateTimeFormat("en-US", { timeZone: t.timeZone, weekday: "long" }).format(new Date(d.now()));
      const m = t.clock.minutes;
      return { date: t.clock.date, time: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, weekday, timeZone: t.timeZone };
    },

    async language() { return (await d.store.getAppPrefs(d.userId))?.language; },
    async setLanguage(language) {
      const prefs = await d.store.getAppPrefs(d.userId);
      await d.store.putAppPrefs({ ...prefs, userId: d.userId, language, updatedAt: d.now() });
    },

    async today() {
      const s = await d.store.getAppSettings(d.userId);
      return s ? { onboarded: s.onboardedAt !== undefined, state: await stateOf(s) } : { onboarded: false, state: null };
    },

    async saveSettings(patch: SettingsPatch) {
      const before = await d.store.getAppSettings(d.userId);
      if (patch.calories !== undefined && (!Number.isInteger(patch.calories) || patch.calories < CALORIE_RANGE.min || patch.calories > CALORIE_RANGE.max)) {
        return { ok: false as const, error: `calories must be a whole number from ${CALORIE_RANGE.min} to ${CALORIE_RANGE.max}` };
      }
      if (patch.waterMl !== undefined && (!Number.isInteger(patch.waterMl) || patch.waterMl < WATER_RANGE.min || patch.waterMl > WATER_RANGE.max)) {
        return { ok: false as const, error: `waterMl must be a whole number of millilitres from ${WATER_RANGE.min} to ${WATER_RANGE.max}` };
      }
      if (patch.fat !== undefined && (!Number.isInteger(patch.fat) || patch.fat < FAT_RANGE.min || patch.fat > FAT_RANGE.max)) {
        return { ok: false as const, error: `fat must be a whole number of grams from ${FAT_RANGE.min} to ${FAT_RANGE.max}` };
      }
      if (patch.window && !(Number.isInteger(patch.window.startHour) && Number.isInteger(patch.window.endHour) && patch.window.startHour >= 0 && patch.window.endHour <= 24 && patch.window.endHour > patch.window.startHour)) {
        return { ok: false as const, error: "the window must be two whole hours, the end after the start" };
      }
      const constraints = patch.constraints?.map((c) => c.trim()).filter(Boolean).slice(0, 50);
      const waterMl = patch.waterMl ?? before?.goals.waterMl;
      // Carbs and protein follow the calorie goal; a changed water goal alone keeps the saved goals.
      const fat = patch.fat ?? (patch.calories !== undefined ? undefined : before?.goals.fat);
      const goals = patch.calories !== undefined ? goalsFor(patch.calories, waterMl, patch.fat) : before ? { ...before.goals, ...(fat !== undefined ? { fat } : {}), ...(waterMl !== undefined ? { waterMl } : {}) } : undefined;
      const window = patch.window ?? before?.window;
      const list = constraints ?? before?.constraints;
      if (!goals || !window || !list) {
        const missing = [!goals && "calories", !window && "the eating window", !list && "foods to avoid (an empty list if none)"].filter(Boolean).join(", ");
        return { ok: false as const, error: `Still needed before the first save: ${missing}` };
      }
      await d.store.putAppSettings({
        userId: d.userId, goals, window, constraints: list, updatedAt: d.now(),
        ...(before?.onboardedAt !== undefined ? { onboardedAt: before.onboardedAt } : {}),
        ...(before?.consentAt !== undefined ? { consentAt: before.consentAt } : {}),
      });
      return { ok: true as const };
    },

    async suggest(input) {
      const s = await d.store.getAppSettings(d.userId);
      if (!s || s.onboardedAt === undefined) return { kind: "not_ready" as const };
      const r = await whatNow({ model: d.model, modelName: d.modelName }, { state: await stateOf(s), ...input });
      extraUsage.inputTokens += r.usage.inputTokens;
      extraUsage.outputTokens += r.usage.outputTokens;
      return r;
    },

    async logMeal(meal) {
      const s = await d.store.getAppSettings(d.userId);
      if (!s || s.onboardedAt === undefined) throw new Error("setup is not done");
      const { source, estimate, ...rest } = meal;
      const done = await d.entries.logMeal({ ...rest, source: source ?? "chat", ...(estimate !== undefined ? { estimate } : {}) });
      // Keep today's totals current inside this turn, and hand the model the remainder instead of letting it calculate.
      const t = await day();
      t.eaten = { calories: t.eaten.calories + Math.round(meal.kcal), carbs: t.eaten.carbs + Math.round(meal.carbs), protein: t.eaten.protein + Math.round(meal.protein), fat: (t.eaten.fat ?? 0) + Math.round(meal.fat ?? 0) };
      const fatLeft = (s.goals.fat ?? fatGoal(s.goals.calories)) - (t.eaten.fat ?? 0);
      return { id: done.id, left: { calories: s.goals.calories - t.eaten.calories, carbs: s.goals.carbs - t.eaten.carbs, protein: s.goals.protein - t.eaten.protein, fat: fatLeft } };
    },

    async logWater(ml) {
      const s = await d.store.getAppSettings(d.userId);
      if (!s || s.onboardedAt === undefined) throw new Error("setup is not done");
      const done = await d.entries.logWater(ml, "chat");
      const t = await day();
      t.waterMl += Math.round(ml);
      return { id: done.id, left: { waterMl: (s.goals.waterMl ?? DEFAULT_WATER_GOAL_ML) - t.waterMl } };
    },

    async updateEntry(id, patch) {
      const target = id ?? (await d.entries.today()).filter((e) => e.kind === "meal" && e.source !== "google").pop()?.id;
      if (!target) return { ok: false as const, error: "There is no logged meal to change." };
      const done = await d.entries.update(target, patch);
      if (!done) return { ok: false as const, error: "That entry is not one of the person's own meals. Call list_entries to find it." };
      dayCache = undefined;
      const s = await d.store.getAppSettings(d.userId);
      const t = await day();
      return { ok: true as const, id: done.id, name: done.name, kcal: done.kcal, ...(s ? { left: { calories: s.goals.calories - t.eaten.calories, carbs: s.goals.carbs - t.eaten.carbs, protein: s.goals.protein - t.eaten.protein, fat: (s.goals.fat ?? fatGoal(s.goals.calories)) - (t.eaten.fat ?? 0) } } : {}) };
    },

    async todayEntries() {
      const t = await day();
      const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: t.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
      return (await d.entries.today()).map((e) => ({
        id: e.id, kind: e.kind, name: e.kind === "water" ? "Water" : e.name, time: fmt.format(new Date(e.at)), kcal: e.kcal, protein: e.protein, carbs: e.carbs, fat: e.fat,
        ...(e.ml !== undefined ? { ml: e.ml } : {}), source: e.source,
      }));
    },

    async recentEntries() {
      const t = await day();
      const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: t.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
      return (await d.entries.recent()).map((e) => ({
        id: e.id, kind: e.kind, name: e.kind === "water" ? "Water" : e.name,
        detail: e.kind === "water" ? `${e.ml} ml` : `${e.kcal} kcal, protein ${e.protein} g, carbs ${e.carbs} g, fat ${e.fat ?? 0} g`, when: fmt.format(new Date(e.at)),
      }));
    },
  };
}
