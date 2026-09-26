import { filterName, type DataType } from "./registry.js";

/**
 * A time given by the client. With an offset (`Z`, `+02:00`) it is a physical instant; without one
 * it is civil time, which the Google Health API interprets in the user's time zone.
 */
export type TimePoint =
  | { kind: "physical"; iso: string; ms: number }
  | { kind: "civil"; text: string; date: { year: number; month: number; day: number }; time?: { hours: number; minutes: number; seconds: number } };

const PHYSICAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/;
const CIVIL = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

export function parseTimePoint(value: string): TimePoint | undefined {
  if (PHYSICAL.test(value)) {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? undefined : { kind: "physical", iso: new Date(ms).toISOString(), ms };
  }
  const m = CIVIL.exec(value);
  if (!m) return undefined;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return undefined;
  if (m[4] === undefined) return { kind: "civil", text: `${m[1]}-${m[2]}-${m[3]}`, date: { year, month, day } };
  const [hours, minutes, seconds] = [Number(m[4]), Number(m[5]), Number(m[6] ?? "0")];
  if (hours > 23 || minutes > 59 || seconds > 59) return undefined;
  const text = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${(m[6] ?? "00")}`;
  return { kind: "civil", text, date: { year, month, day }, time: { hours, minutes, seconds } };
}

export type Range =
  | { kind: "physical"; start: Extract<TimePoint, { kind: "physical" }>; end: Extract<TimePoint, { kind: "physical" }> }
  | { kind: "civil"; start: Extract<TimePoint, { kind: "civil" }>; end: Extract<TimePoint, { kind: "civil" }> };

export const TIME_HELP =
  "Use ISO 8601: a date (2026-09-25), a local date-time without offset (2026-09-25T22:00:00, read in the user's time zone), " +
  "or a timestamp with offset (2026-09-25T20:00:00Z).";

/** Parses `start`/`end`, or returns an error message naming the invalid argument. */
export function parseRange(start: string, end: string): Range | { error: string } {
  const s = parseTimePoint(start);
  if (!s) return { error: `Invalid argument \`start\`: "${start}". ${TIME_HELP}` };
  const e = parseTimePoint(end);
  if (!e) return { error: `Invalid argument \`end\`: "${end}". ${TIME_HELP}` };
  if (s.kind !== e.kind) {
    return { error: "Invalid argument `end`: `start` and `end` must both have a UTC offset or both be local times without one." };
  }
  if (s.kind === "physical" && e.kind === "physical") {
    if (e.ms <= s.ms) return { error: "Invalid argument `end`: it must be after `start`." };
    return { kind: "physical", start: s, end: e };
  }
  if (s.kind === "civil" && e.kind === "civil") {
    if (normalizedCivil(e) <= normalizedCivil(s)) return { error: "Invalid argument `end`: it must be after `start`." };
    return { kind: "civil", start: s, end: e };
  }
  return { error: "Invalid argument `start`." };
}

function normalizedCivil(p: Extract<TimePoint, { kind: "civil" }>): string {
  return p.text.length === 10 ? `${p.text}T00:00:00` : p.text;
}

/**
 * The `filter` for `dataPoints.list` (AIP-160, as the discovery document describes per kind).
 * Closed-open: `>= start AND < end`.
 */
export function listFilter(type: DataType, range: Range): string | { error: string } {
  const f = filterName(type.id);
  const between = (field: string, a: string, b: string) => `${field} >= "${a}" AND ${field} < "${b}"`;
  const physical = range.kind === "physical";
  const a = physical ? range.start.iso : range.start.text;
  const b = physical ? range.end.iso : range.end.text;
  switch (type.kind) {
    case "interval":
      return between(`${f}.interval.${physical ? "start_time" : "civil_start_time"}`, a, b);
    case "sample":
      return between(`${f}.sample_time.${physical ? "physical_time" : "civil_time"}`, a, b);
    case "daily":
      if (physical || range.start.time || range.end.time) {
        return { error: `\`${type.id}\` is a daily type: give \`start\` and \`end\` as dates, e.g. 2026-09-20.` };
      }
      return between(`${f}.date`, a, b);
    case "session":
      if (type.id === "sleep") return between(`sleep.interval.${physical ? "end_time" : "civil_end_time"}`, a, b);
      if (type.id === "electrocardiogram") {
        if (!physical) return { error: "`electrocardiogram` can only be filtered by a start timestamp with a UTC offset." };
        // The API filters ECG by start time only, and only with >=.
        return `electrocardiogram.interval.start_time >= "${a}"`;
      }
      if (physical) {
        return { error: `\`${type.id}\` is filtered in local time: give \`start\` and \`end\` without a UTC offset, e.g. 2026-09-25 or 2026-09-25T08:00:00.` };
      }
      return between(`${f}.interval.civil_start_time`, a, b);
  }
}

/** A civil point in the API's CivilDateTime shape. */
export function civilDateTime(p: Extract<TimePoint, { kind: "civil" }>) {
  return { date: p.date, ...(p.time ? { time: p.time } : {}) };
}
