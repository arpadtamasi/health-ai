// US-01m3rw2bqxkqp6v1hg9g02t1zr (chat onboarding): the first chat asks for foods to avoid, the daily calories and the eating
// window, then the notice and the consent. These functions turn the typed answers into settings.

/** "nuts, fish" or "nuts and fish" -> ["nuts", "fish"]; "none" (or nothing) -> []. */
export function parseConstraints(text: string): string[] {
  const t = text.trim().toLowerCase();
  if (!t || ["none", "nothing", "no", "nincs", "semmi"].includes(t)) return [];
  return t.split(/[,;\n]|\band\b|\bés\b/).map((x) => x.trim()).filter(Boolean).slice(0, 50);
}

/** "1900", "1,900 kcal", "1900 kcal" -> 1900; anything outside 500..10000 -> undefined. */
export function parseCalories(text: string): number | undefined {
  const m = /(\d[\d.,\s]*)/.exec(text);
  if (!m) return undefined;
  const n = Number(m[1]!.replace(/[.,\s]/g, ""));
  return Number.isInteger(n) && n >= 500 && n <= 10000 ? n : undefined;
}

/** "7 to 22", "7-22", "from 7 to 22", "7:00-22:00" -> {startHour: 7, endHour: 22}; the end must come after the start. */
export function parseWindow(text: string): { startHour: number; endHour: number } | undefined {
  const m = /(\d{1,2})(?::00)?\s*(?:-|–|to|till|until|és|-tól|tól)?\s*(\d{1,2})(?::00)?/i.exec(text);
  if (!m) return undefined;
  const startHour = Number(m[1]);
  const endHour = Number(m[2]);
  return startHour >= 0 && startHour <= 23 && endHour >= 1 && endHour <= 24 && endHour > startHour ? { startHour, endHour } : undefined;
}

/** The default split of the calorie goal: about half from carbs and a quarter from protein (4 kcal per gram). */
export function defaultGoals(calories: number) {
  return { calories, carbs: Math.round((calories * 0.5) / 4), protein: Math.round((calories * 0.25) / 4) };
}
