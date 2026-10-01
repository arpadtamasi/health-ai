// The tools of the chat agent, bound to one signed-in user: the app's settings, today's log and the Google Health write.
import type { AgentEnv, Clock, SettingsPatch } from "../ai/agent.js";
import type { AiModel } from "../ai/model.js";
import type { DayState, Usage } from "../ai/types.js";
import { whatNow } from "../ai/whatNow.js";
import type { HealthApi } from "../health/api.js";
import type { AppSettings, Store } from "../store/types.js";
import { logNutrition, timeZoneOf } from "./meal.js";
import { loadToday, localClock } from "./today.js";

export const CALORIE_RANGE = { min: 500, max: 10000 };

/** Calories to goals: about half the calories from carbs and a quarter from protein, 4 kcal per gram. */
export function goalsFor(calories: number) {
  return { calories, carbs: Math.round((calories * 0.5) / 4), protein: Math.round((calories * 0.25) / 4) };
}

export interface AgentEnvDeps {
  store: Store;
  api: HealthApi;
  model: AiModel;
  modelName: string;
  userId: string;
  now: () => number;
}

export function makeAgentEnv(d: AgentEnvDeps): AgentEnv & { extraUsage: Usage } {
  const extraUsage: Usage = { inputTokens: 0, outputTokens: 0 };
  let todayCache: Awaited<ReturnType<typeof loadToday>> | undefined;
  const today = async () => (todayCache ??= await loadToday(d.api, d.now()));

  const stateOf = async (s: AppSettings): Promise<DayState> => {
    const t = await today();
    return { goals: s.goals, eaten: t.eaten, minutesNow: t.clock.minutes, window: s.window, constraints: s.constraints };
  };

  return {
    extraUsage,

    async clock(): Promise<Clock> {
      const timeZone = await timeZoneOf(d.api);
      const nowMs = d.now();
      const { date, minutes } = localClock(nowMs, timeZone);
      const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(new Date(nowMs));
      return { date, time: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`, weekday, timeZone };
    },

    async language() { return (await d.store.getAppPrefs(d.userId))?.language; },
    async setLanguage(language) { await d.store.putAppPrefs({ userId: d.userId, language, updatedAt: d.now() }); },

    async today() {
      const s = await d.store.getAppSettings(d.userId);
      return s ? { onboarded: s.onboardedAt !== undefined, state: await stateOf(s) } : { onboarded: false, state: null };
    },

    async saveSettings(patch: SettingsPatch) {
      const before = await d.store.getAppSettings(d.userId);
      if (patch.calories !== undefined && (!Number.isInteger(patch.calories) || patch.calories < CALORIE_RANGE.min || patch.calories > CALORIE_RANGE.max)) {
        return { ok: false as const, error: `calories must be a whole number from ${CALORIE_RANGE.min} to ${CALORIE_RANGE.max}` };
      }
      if (patch.window && !(Number.isInteger(patch.window.startHour) && Number.isInteger(patch.window.endHour) && patch.window.startHour >= 0 && patch.window.endHour <= 24 && patch.window.endHour > patch.window.startHour)) {
        return { ok: false as const, error: "the window must be two whole hours, the end after the start" };
      }
      const constraints = patch.constraints?.map((c) => c.trim()).filter(Boolean).slice(0, 50);
      const goals = patch.calories !== undefined ? goalsFor(patch.calories) : before?.goals;
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
      const done = await logNutrition(d.api, d.now(), meal);
      // Keep today's totals current inside this turn, and hand the model the remainder instead of letting it calculate.
      const t = await today();
      t.eaten = { calories: t.eaten.calories + Math.round(meal.kcal), carbs: t.eaten.carbs + Math.round(meal.carbs), protein: t.eaten.protein + Math.round(meal.protein) };
      return { id: done.id, left: { calories: s.goals.calories - t.eaten.calories, carbs: s.goals.carbs - t.eaten.carbs, protein: s.goals.protein - t.eaten.protein } };
    },
  };
}
