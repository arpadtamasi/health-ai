// One seam between the screens and the data: the real API (the same origin on the web) or sample data for design work.
// EXPO_PUBLIC_MOCK=1 selects the sample data.
import { api, type DayState, type Settings, type WhatNow } from "./api/client";
import type { Option } from "./components/food";
import { eatenToday, goals, suggestions } from "./data/mock";

export interface Backend {
  me(): Promise<{ email: string; onboarded: boolean }>;
  state(): Promise<DayState>;
  saveSettings(s: Omit<Settings, "onboardedAt"> & { consent?: boolean }): Promise<void>;
  whatNow(input: Parameters<typeof api.whatNow>[0]): Promise<WhatNow>;
  log(o: Option): Promise<{ id: string | null }>;
  unlog(id: string): Promise<void>;
}

export const realBackend: Backend = {
  me: () => api.me(),
  state: () => api.state(),
  saveSettings: async (s) => { await api.saveSettings(s); },
  whatNow: (input) => api.whatNow(input),
  log: (o) => api.log({ name: o.name, kcal: o.kcal, carbs: o.carbs, protein: o.protein }),
  unlog: async (id) => { await api.unlog(id); },
};

function minutesNow(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function mockBackend(): Backend {
  let eaten = { ...eatenToday };
  return {
    me: () => Promise.resolve({ email: "sample@example.com", onboarded: true }),
    state: () => Promise.resolve({ goals: { calories: goals.calories, carbs: goals.carbs, protein: goals.protein }, window: goals.window, constraints: [], eaten: { ...eaten }, date: "", minutes: minutesNow(), timeZone: "UTC" }),
    saveSettings: () => Promise.resolve(),
    whatNow: () => Promise.resolve({ kind: "options", options: suggestions, basis: "Sample options: the model is not connected in this mode." }),
    log: (o) => { eaten = { calories: eaten.calories + o.kcal, carbs: eaten.carbs + o.carbs, protein: eaten.protein + o.protein }; return Promise.resolve({ id: `sample-${o.name}` }); },
    unlog: () => Promise.resolve(),
  };
}

export const backend: Backend = process.env.EXPO_PUBLIC_MOCK === "1" ? mockBackend() : realBackend;
