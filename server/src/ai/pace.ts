import type { DayState, Macros } from "./types.js";

/** Share of the day passed: 0 before the waking window starts, 1 after it ends. The app computes the same figure. */
export function dayFraction(minutes: number, w: DayState["window"]): number {
  const start = w.startHour * 60;
  const end = w.endHour * 60;
  if (end <= start) throw new Error("The window must end after it starts.");
  return Math.min(1, Math.max(0, (minutes - start) / (end - start)));
}

/** Eaten minus planned by now, per macro; negative means behind the plan. */
export function gaps(state: DayState): Macros {
  const f = dayFraction(state.minutesNow, state.window);
  return {
    calories: Math.round(state.eaten.calories - state.goals.calories * f),
    carbs: Math.round(state.eaten.carbs - state.goals.carbs * f),
    protein: Math.round(state.eaten.protein - state.goals.protein * f),
    ...(state.goals.fat !== undefined ? { fat: Math.round((state.eaten.fat ?? 0) - state.goals.fat * f) } : {}),
  };
}

/** The macro furthest behind relative to its own goal, so grams and kilocalories compare fairly; null when none is behind. */
export function worstMacro(state: DayState): "calories" | "carbs" | "protein" | null {
  const g = gaps(state) as Record<"calories" | "carbs" | "protein", number>;
  type Key = "calories" | "carbs" | "protein";
  const rel = (k: Key) => (state.goals[k] > 0 ? g[k] / state.goals[k] : 0);
  const keys: Key[] = ["calories", "carbs", "protein"];
  const worst = keys.reduce((a, b) => (rel(b) < rel(a) ? b : a));
  return g[worst] < 0 ? worst : null;
}
