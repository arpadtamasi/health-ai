// The service scales to zero, so the first call after a quiet hour can take several seconds (BR quality "The app stays usable on a
// slow response"). This file is what the screens use to cope: a status they can show ("the connection is slow"), a retry for calls
// that are safe to repeat, and a timeout so that nothing waits forever.
export interface NetStatus { pending: number; slow: boolean }

type Listener = (s: NetStatus) => void;
const listeners = new Set<Listener>();
let pending = 0;
let slow = false;
const timers = new Set<ReturnType<typeof setTimeout>>();

const emit = () => { const s = { pending, slow }; for (const l of listeners) l(s); };
export const netStatus = (): NetStatus => ({ pending, slow });
export function subscribe(l: Listener): () => void { listeners.add(l); return () => { listeners.delete(l); }; }

/** Marks a call as in flight; when it is still running after `slowAfterMs`, the status turns slow until nothing is pending. */
export async function track<T>(work: Promise<T>, slowAfterMs = 2500): Promise<T> {
  pending += 1;
  const timer = setTimeout(() => { timers.delete(timer); if (pending > 0 && !slow) { slow = true; emit(); } }, slowAfterMs);
  timers.add(timer);
  emit();
  try { return await work; }
  finally {
    clearTimeout(timer); timers.delete(timer);
    pending -= 1;
    if (pending === 0) slow = false;
    emit();
  }
}

/** Runs `fn` again after a short wait when it fails in a way that repeating can fix (the network, or 502/503/504 while an instance starts). */
export async function withRetry<T>(fn: () => Promise<T>, o: { retries: number; waitMs: number; retryable: (e: unknown) => boolean }): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (attempt >= o.retries || !o.retryable(e)) throw e;
      await new Promise((r) => setTimeout(r, o.waitMs * (attempt + 1)));
    }
  }
}

/** Rejects with `onTimeout()` when `work` does not finish in time (the caller aborts the request itself). */
export function withTimeout<T>(work: Promise<T>, ms: number, onTimeout: () => Error): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(onTimeout()), ms);
    work.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}
