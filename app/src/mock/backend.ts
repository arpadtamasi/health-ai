// Sample data instead of the API, for design work (EXPO_PUBLIC_MOCK=1). Never part of the deployed app.
import type { Backend } from "../backend";
import type { DayEntry } from "../day";
import { entries as seed, goals, suggestions } from "./data";

function minutesNow(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function mockBackend(): Backend {
  let list: DayEntry[] = [...seed];
  let seq = 0;
  const sum = (k: "kcal" | "carbs" | "protein" | "fat") => list.reduce((a, e) => a + e[k], 0);
  return {
    me: () => Promise.resolve({ email: "sample@example.com", onboarded: true, language: null, healthConnected: true }),
    state: () => Promise.resolve({
      goals: { calories: goals.calories, carbs: goals.carbs, protein: goals.protein, fat: goals.fat }, window: goals.window, constraints: [],
      eaten: { calories: sum("kcal"), carbs: sum("carbs"), protein: sum("protein"), fat: sum("fat") }, date: "", minutes: minutesNow(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      water: { ml: list.reduce((a, e) => a + (e.ml ?? 0), 0), goalMl: goals.waterMl },
    }),
    chat: () => Promise.resolve({ events: [{ type: "text", text: "Sample mode: the model is not connected." }, { type: "options", options: suggestions, basis: "Sample options." }], needsConsent: false, onboarded: true, language: null }),
    consent: () => Promise.resolve(),
    chatHistory: () => Promise.resolve([]),
    usuals: () => Promise.resolve([{ kind: "meal" as const, name: "Cappuccino", kcal: 95, carbs: 10, protein: 2, fat: 3, count: 9 }, { kind: "water" as const, name: "250 ml", kcal: 0, carbs: 0, protein: 0, fat: 0, ml: 250, count: 6 }]),
    log: (o) => { const id = `sample-${++seq}`; list = [...list, { id, kind: "meal", name: o.name, kcal: o.kcal, carbs: o.carbs, protein: o.protein, fat: o.fat ?? 0, at: Date.now(), source: "button", estimate: false, ingredients: [] }]; return Promise.resolve({ id }); },
    unlog: (id) => { list = list.filter((e) => e.id !== id); return Promise.resolve(); },
    water: (ml) => { const id = `sample-${++seq}`; list = [...list, { id, kind: "water", name: "Water", kcal: 0, carbs: 0, protein: 0, fat: 0, ml, at: Date.now(), source: "button", estimate: false, ingredients: [] }]; return Promise.resolve({ id }); },
    entriesToday: () => Promise.resolve([...list].sort((a, b) => a.at - b.at)),
    updateEntry: (patch) => {
      const { id, time, mealType: _m, ...rest } = patch;
      list = list.map((e) => (e.id === id ? { ...e, ...rest, ...(time ? { at: (() => { const d = new Date(e.at); const [h, m] = time.split(":").map(Number); d.setHours(h ?? 0, m ?? 0, 0, 0); return d.getTime(); })() } : {}) } : e));
      return Promise.resolve(list.find((e) => e.id === id)!);
    },
    deleteEntries: (ids) => { list = list.filter((e) => !ids.includes(e.id)); return Promise.resolve(); },
    deleteAll: () => { list = []; return Promise.resolve(); },
  };
}
