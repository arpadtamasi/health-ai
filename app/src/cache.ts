// The last thing the app knew, kept on the device so that the screen can draw at once and the server confirms afterwards (the
// first call after a quiet hour is slow). Web uses localStorage; elsewhere (or when storage is blocked) it is only kept in memory.
const memory = new Map<string, string>();
const PREFIX = "healthai:";

function store(): Storage | undefined {
  try { return typeof localStorage !== "undefined" ? localStorage : undefined; } catch { return undefined; }
}

export function cacheGet<T>(key: string): T | undefined {
  try {
    const raw = store()?.getItem(PREFIX + key) ?? memory.get(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch { return undefined; }
}

export function cacheSet(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try { store()?.setItem(PREFIX + key, raw); } catch { /* storage full or blocked: the memory copy stays */ }
}

/** Forgets everything: on sign-out, so that the next person on this device does not see the last one's day. */
export function cacheClear(): void {
  memory.clear();
  try { const s = store(); if (s) for (const k of Object.keys(s)) if (k.startsWith(PREFIX)) s.removeItem(k); } catch { /* nothing to clear */ }
}
