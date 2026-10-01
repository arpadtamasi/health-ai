// Sample data instead of the API, for design work (EXPO_PUBLIC_MOCK=1). Never part of the deployed app.
import type { Backend } from "../backend";
import type { Option } from "../components/food";
import { eatenToday, goals, suggestions } from "./data";

function minutesNow(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function mockBackend(): Backend {
  let eaten = { ...eatenToday };
  return {
    me: () => Promise.resolve({ email: "sample@example.com", onboarded: true, language: null, healthConnected: true }),
    state: () => Promise.resolve({ goals: { calories: goals.calories, carbs: goals.carbs, protein: goals.protein }, window: goals.window, constraints: [], eaten: { ...eaten }, date: "", minutes: minutesNow(), timeZone: "UTC", water: { ml: 750, goalMl: 2000 } }),
    chat: () => Promise.resolve({ events: [{ type: "text", text: "Sample mode: the model is not connected." }, { type: "options", options: suggestions, basis: "Sample options." }], needsConsent: false, onboarded: true, language: null }),
    consent: () => Promise.resolve(),
    usuals: () => Promise.resolve([{ kind: "meal" as const, name: "Cappuccino", kcal: 95, carbs: 10, protein: 2, count: 9 }, { kind: "water" as const, name: "Water", kcal: 0, carbs: 0, protein: 0, ml: 250, count: 6 }]),
    log: (o) => { eaten = { calories: eaten.calories + o.kcal, carbs: eaten.carbs + o.carbs, protein: eaten.protein + o.protein }; return Promise.resolve({ id: `sample-${o.name}` }); },
    unlog: () => Promise.resolve(),
    water: () => Promise.resolve({ id: "sample-water" }),
    deleteEntries: () => Promise.resolve(),
    deleteAll: () => Promise.resolve(),
  };
}

