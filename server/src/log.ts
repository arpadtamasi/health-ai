import { createHmac } from "node:crypto";

/**
 * Structured log line for Cloud Logging. Callers pass only operational fields:
 * BR-01m3eb1d1eddbp6nd8cm0nnjtm (No health data in logs) forbids health values,
 * meal contents, tokens, intents and feedback text here.
 */
export function logEvent(fields: Record<string, string | number | boolean>): void {
  console.log(JSON.stringify(fields));
}

/** A stable pseudonymous user id for logs and owner reports; not reversible without the key. */
export function pseudonym(key: Uint8Array, userId: string): string {
  return createHmac("sha256", key).update(userId).digest("base64url").slice(0, 12);
}
