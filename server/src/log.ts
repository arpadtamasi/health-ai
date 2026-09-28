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

/**
 * The field paths of a payload without any value, e.g. `energy.kcal,nutrients[].nutrient`, so a
 * rejected write can be diagnosed from the logs. BR-01m3eb1d1eddbp6nd8cm0nnjtm (No health data in
 * logs): keys are the API's schema, values never leave this function.
 */
export function shapeOf(value: unknown, max = 400): string {
  const paths = new Set<string>();
  const walk = (v: unknown, path: string): void => {
    if (Array.isArray(v)) {
      for (const item of v) walk(item, `${path}[]`);
      if (v.length === 0) paths.add(`${path}[]`);
    } else if (v !== null && typeof v === "object") {
      const entries = Object.entries(v);
      if (entries.length === 0 && path) paths.add(path);
      for (const [k, child] of entries) walk(child, path ? `${path}.${k}` : k);
    } else if (path) {
      paths.add(path);
    }
  };
  walk(value, "");
  const out = [...paths].sort().join(",");
  return out.length > max ? `${out.slice(0, max)}…` : out;
}
