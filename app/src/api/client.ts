// The app talks to the same origin on the web (Firebase Hosting rewrites /api/* to Cloud Run), with the __session cookie.
// Every request that changes anything also sends the custom header, as CSRF protection.
import { track, withRetry, withTimeout } from "../net";
import { lineReader, type StreamLine } from "../stream";
import type { DayEntry } from "../day";
import type { Option } from "../components/food";

export type { DayEntry };
export interface EntryPatch { id: string; name?: string; kcal?: number; carbs?: number; protein?: number; fat?: number; time?: string; mealType?: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER"; ingredients?: string[] }

export interface Macros { calories: number; carbs: number; protein: number; fat: number }
export interface Settings {
  goals: Macros;
  window: { startHour: number; endHour: number };
  constraints: string[];
  onboardedAt?: number;
}
export interface DayState {
  goals: Macros;
  window: { startHour: number; endHour: number };
  constraints: string[];
  eaten: Macros;
  date: string;
  minutes: number;
  timeZone: string;
  water: { ml: number; goalMl: number };
}
export type WhatNow =
  | { kind: "options"; options: Option[]; basis: string }
  | { kind: "no_ranking"; reason: "below_floor" | "nothing_fits" | "nothing_visible" };

export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "options"; options: Option[]; basis: string }
  | { type: "logged"; name: string; kcal: number; id: string | null }
  | { type: "logged_water"; ml: number; id: string | null }
  | { type: "updated"; id: string; name: string; kcal: number }
  | { type: "confirm_delete"; ids: string[]; all: boolean; labels: string[] }
  | { type: "settings_saved" }
  | { type: "replies"; replies: string[] }
  | { type: "language"; language: "en" | "hu" };
export interface ChatReply { events: ChatEvent[]; needsConsent: boolean; onboarded: boolean; language: "en" | "hu" | null; stopped?: boolean }
/** A stored message of the conversation (the server keeps the chat during the test). */
export interface HistoryTurn { role: "user" | "assistant"; at: number; text?: string; images?: number; events?: ChatEvent[] }
export interface ChatTurn { role: "user" | "assistant"; text: string; images?: { mediaType: "image/jpeg"; dataBase64: string }[] }

export interface Usual { kind: "meal" | "water"; name: string; kcal: number; carbs: number; protein: number; fat: number; ml?: number; count: number }
export interface Me { email: string; onboarded: boolean; language: "en" | "hu" | null; healthConnected: boolean }

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, readonly body: unknown) {
    super(`API ${status} ${code}`);
  }
}

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

/** The phone's own time zone, so that "today" and "now" are the person's, wherever they are. */
function timeZone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; }
}

const RETRY_STATUS = new Set([502, 503, 504]);
const TIMEOUT_MS = 45_000;

async function once<T>(method: "GET" | "POST" | "PUT", path: string, body?: unknown): Promise<T> {
  const ctl = new AbortController();
  const res = await withTimeout(fetch(`${API_BASE}/api/app${path}`, {
    method,
    credentials: "include",
    signal: ctl.signal,
    headers: { "x-timezone": timeZone(), ...(body ? { "content-type": "application/json" } : {}), ...(method !== "GET" ? { "x-health-ai": "1" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }), TIMEOUT_MS, () => { ctl.abort(); return new ApiError(0, "timeout", {}); });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, json.error ?? "error", json);
  return json as T;
}

/**
 * One call to the API. The service scales to zero, so the first call can be slow (or answer 503 while an instance starts): reads are
 * repeated once, and the screens learn about a slow call from net.ts. Writes are never repeated here, because a second try could
 * log a meal twice.
 */
function call<T>(method: "GET" | "POST" | "PUT", path: string, body?: unknown): Promise<T> {
  const attempt = () => once<T>(method, path, body);
  const work = method === "GET"
    ? withRetry(attempt, { retries: 1, waitMs: 700, retryable: (e) => (e instanceof ApiError ? RETRY_STATUS.has(e.status) : true) })
    : attempt();
  return track(work);
}

/** Wakes the service before it is needed (when the person opens the app or starts typing); never waits for the answer. */
export function warmUp(): void {
  void fetch(`${API_BASE}/health`, { cache: "no-store" }).catch(() => undefined);
}

/** The Google sign-in starts on the server; the browser comes back to the app with the session cookie. */
export const signInUrl = `${API_BASE}/api/auth/start`;
/** Connecting Google Health afterwards: the same sign-in, asking for the Health permissions. */
export const connectHealthUrl = `${API_BASE}/api/auth/connect-health`;

export type ChatInput = { message: string; history: ChatTurn[]; images?: { mediaType: "image/jpeg" | "image/png" | "image/webp"; dataBase64: string }[]; intent?: "ate" | "would" };

/** The Cloud Run service's own address: the streamed chat goes there, past Firebase Hosting, which holds a stream back until it ends. */
export const STREAM_BASE = process.env.EXPO_PUBLIC_STREAM_BASE ?? "";

/**
 * BR-01m6pmf9avbbgd373z1jcvvaqw (A reply arrives as it is written, with its steps): the chat, streamed. A ticket comes from the
 * session (through Hosting), the reply straight from the service, one line at a time to `onLine`; Stop aborts `signal`. Without a
 * stream address (a local build) the whole reply comes through Hosting as before. QA-01m6pmf9hz17nxcj3tedpxmbyr: the slow-connection
 * notice watches the wait for the first line, not the whole reply.
 */
export async function chatStream(input: ChatInput, onLine: (l: StreamLine) => void, signal?: AbortSignal): Promise<ChatReply> {
  if (!STREAM_BASE || typeof TextDecoder === "undefined") return api.chat(input);
  const { ticket } = await call<{ ticket: string }>("POST", "/chat/ticket", {});
  const ctl = new AbortController();
  const stop = () => ctl.abort();
  signal?.addEventListener("abort", stop);
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctl.abort(); }, TIMEOUT_MS);
  let first: () => void = () => undefined;
  void track(new Promise<void>((r) => { first = r; }));
  try {
    const res = await fetch(`${STREAM_BASE}/api/stream/chat`, {
      method: "POST", signal: ctl.signal,
      headers: { authorization: `Bearer ${ticket}`, "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; throw new ApiError(res.status, j.error ?? "error", j); }
    const read = lineReader();
    const dec = new TextDecoder();
    let reply: ChatReply | undefined;
    const take = (chunk: string) => {
      for (const l of read(chunk)) {
        first();
        if (l.type === "done") reply = l.reply as ChatReply;
        else if (l.type === "error") throw new ApiError(l.status, l.error ?? "error", l);
        else onLine(l);
      }
    };
    const reader = res.body?.getReader();
    if (reader) for (;;) { const { done, value } = await reader.read(); if (done) break; take(dec.decode(value, { stream: true })); }
    else take(await res.text());
    take("\n");
    if (!reply) throw new ApiError(0, "network", {});
    return reply;
  } catch (e) {
    if (timedOut) throw new ApiError(0, "timeout", {});
    if (signal?.aborted) throw new ApiError(0, "stopped", {});
    throw e;
  } finally {
    first();
    clearTimeout(timer);
    signal?.removeEventListener("abort", stop);
  }
}

export const api = {
  me: () => call<Me>("GET", "/me"),
  settings: () => call<{ settings: Settings | null }>("GET", "/settings"),
  saveSettings: (s: Omit<Settings, "onboardedAt"> & { consent?: boolean }) => call<{ settings: Settings }>("PUT", "/settings", s),
  state: () => call<DayState>("GET", "/state"),
  whatNow: (input: { optionsText?: string; image?: { mediaType: "image/jpeg" | "image/png" | "image/webp"; dataBase64: string } }) => call<WhatNow>("POST", "/what-now", input),
  log: (o: { name: string; kcal: number; carbs: number; protein: number; fat?: number; ingredients?: string[]; source?: "photo" | "typed" | "button" | "chat" }) => call<{ id: string | null }>("POST", "/log", o),
  water: (ml: number) => call<{ id: string | null }>("POST", "/water", { ml }),
  deleteEntries: (ids: string[]) => call<{ deleted: number }>("POST", "/entries/delete", { ids }),
  deleteAll: () => call<{ deleted: number }>("POST", "/entries/delete-all", {}),
  unlog: (id: string) => call<{ ok: true }>("POST", "/unlog", { id }),
  // US-01m3s789qmvs4jx8e93nb2j61n: what "What should I eat now?" showed and which option was logged (null: none).
  choice: (body: { options: { rank: number; name: string; kcal: number; carbs: number; protein: number; fat?: number }[]; chosenRank: number | null }) => call<{ ok: true }>("POST", "/choice", body),
  entriesToday: () => call<{ entries: DayEntry[] }>("GET", "/entries/today"),
  updateEntry: (patch: EntryPatch) => call<{ entry: DayEntry }>("POST", "/entries/update", patch),
  chat: (input: ChatInput) => call<ChatReply>("POST", "/chat", input),
  chatHistory: () => call<{ turns: HistoryTurn[] }>("GET", "/chat/history?limit=60"),
  consent: () => call<{ ok: true }>("POST", "/consent", {}),
  usuals: () => call<{ usuals: Usual[] }>("GET", "/usuals"),
  logout: () => call<{ ok: true }>("POST", "/logout"),
};
