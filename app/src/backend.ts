// One seam between the screens and the data: the real API (the same origin on the web) or sample data for design work.
// EXPO_PUBLIC_MOCK=1 selects the sample data.
import { api, type ChatReply, type DayState } from "./api/client";
import type { Option } from "./components/food";
import { eatenToday, goals, suggestions } from "./data/mock";

export interface Backend {
  me(): Promise<{ email: string; onboarded: boolean }>;
  state(): Promise<DayState>;
  chat(input: Parameters<typeof api.chat>[0]): Promise<ChatReply>;
  consent(): Promise<void>;
  log(o: Option): Promise<{ id: string | null }>;
  unlog(id: string): Promise<void>;
}

export const realBackend: Backend = {
  me: () => api.me(),
  state: () => api.state(),
  chat: (input) => api.chat(input),
  consent: async () => { await api.consent(); },
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
    chat: () => Promise.resolve({ events: [{ type: "text", text: "Sample mode: the model is not connected." }, { type: "options", options: suggestions, basis: "Sample options." }], needsConsent: false, onboarded: true }),
    consent: () => Promise.resolve(),
    log: (o) => { eaten = { calories: eaten.calories + o.kcal, carbs: eaten.carbs + o.carbs, protein: eaten.protein + o.protein }; return Promise.resolve({ id: `sample-${o.name}` }); },
    unlog: () => Promise.resolve(),
  };
}

export const backend: Backend = process.env.EXPO_PUBLIC_MOCK === "1" ? mockBackend() : realBackend;
