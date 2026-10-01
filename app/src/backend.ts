// One seam between the screens and the data: the real API (the same origin on the web) or sample data for design work.
// EXPO_PUBLIC_MOCK=1 selects the sample data.
import { api, type ChatReply, type DayState, type Me, type Usual } from "./api/client";
import type { Option } from "./components/food";

export interface Backend {
  me(): Promise<Me>;
  state(): Promise<DayState>;
  chat(input: Parameters<typeof api.chat>[0]): Promise<ChatReply>;
  consent(): Promise<void>;
  usuals(): Promise<Usual[]>;
  log(o: Option): Promise<{ id: string | null }>;
  unlog(id: string): Promise<void>;
  water(ml: number): Promise<{ id: string | null }>;
  deleteEntries(ids: string[]): Promise<void>;
  deleteAll(): Promise<void>;
}

export const realBackend: Backend = {
  me: () => api.me(),
  state: () => api.state(),
  chat: (input) => api.chat(input),
  consent: async () => { await api.consent(); },
  usuals: async () => (await api.usuals()).usuals,
  log: (o) => api.log({ name: o.name, kcal: o.kcal, carbs: o.carbs, protein: o.protein, ...(o.ingredients?.length ? { ingredients: o.ingredients } : {}), ...(o.rank > 0 ? { source: "photo" as const } : { source: "button" as const }) }),
  unlog: async (id) => { await api.unlog(id); },
  water: (ml) => api.water(ml),
  deleteEntries: async (ids) => { await api.deleteEntries(ids); },
  deleteAll: async () => { await api.deleteAll(); },
};

/**
 * EXPO_PUBLIC_MOCK=1 selects sample data for design work. The require sits in a branch that is false in a normal build, so the
 * bundler drops it and the sample data never reaches the deployed app (the deploy script checks for it).
 */
export const backend: Backend = process.env.EXPO_PUBLIC_MOCK === "1"
  ? (require("./mock/backend") as typeof import("./mock/backend")).mockBackend()
  : realBackend;
