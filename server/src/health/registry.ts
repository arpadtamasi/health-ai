/**
 * The data types Health AI exposes, from the Google Health API v4 discovery document
 * (docs/google-health-api.md). Adding a type is one entry here, not a new tool (design D6).
 * The scope category of each type is inferred from the API's names and confirmed in task 1.2.
 */

export type DataKind = "interval" | "sample" | "daily" | "session";

export type ScopeCategory =
  | "activity_and_fitness" | "health_metrics_and_measurements" | "sleep" | "nutrition" | "mindfulness"
  | "logged_symptoms" | "reproductive_health" | "ecg" | "irn";

export interface DataType {
  /** Kebab-case id used in the API path, e.g. `heart-rate`. */
  id: string;
  kind: DataKind;
  category: ScopeCategory;
  description: string;
  /** `dataPoints:rollUp` (physical windows, used for hour buckets). */
  rollUp: boolean;
  /** `dataPoints:dailyRollUp` (civil windows, used for day and week buckets). */
  dailyRollUp: boolean;
  /** Health AI lets clients write, update and delete this type. */
  writable: boolean;
  /** For writable types: the payload fields, in the API's format. */
  writeFields?: { required: string[]; optional: string[]; example: Record<string, unknown> };
}

const t = (
  id: string, kind: DataKind, category: ScopeCategory, description: string,
  agg: "both" | "none" = "none", extra: Partial<DataType> = {},
): DataType => ({ id, kind, category, description, rollUp: agg === "both", dailyRollUp: agg === "both", writable: false, ...extra });

const SESSION_INTERVAL = "interval: {startTime, endTime (RFC 3339), startUtcOffset, endUtcOffset (e.g. \"7200s\")}";

export const DATA_TYPES: readonly DataType[] = [
  t("steps", "interval", "activity_and_fitness", "Step counts per interval.", "both"),
  t("distance", "interval", "activity_and_fitness", "Distance covered per interval.", "both"),
  t("floors", "interval", "activity_and_fitness", "Floors climbed per interval.", "both"),
  t("altitude", "interval", "activity_and_fitness", "Altitude gained per interval.", "both"),
  t("active-minutes", "interval", "activity_and_fitness", "Active minutes per interval.", "both"),
  t("active-zone-minutes", "interval", "activity_and_fitness", "Active Zone Minutes per interval.", "both"),
  t("sedentary-period", "interval", "activity_and_fitness", "Sedentary periods.", "both"),
  t("active-energy-burned", "interval", "activity_and_fitness", "Active energy burned (kcal) per interval.", "both"),
  t("basal-energy-burned", "interval", "activity_and_fitness", "Basal energy burned (kcal) per interval."),
  t("time-in-heart-rate-zone", "interval", "activity_and_fitness", "Time spent in each heart rate zone.", "both"),
  t("swim-lengths-data", "interval", "activity_and_fitness", "Swim lengths.", "both"),
  t("activity-level", "daily", "activity_and_fitness", "Daily activity level.", "both"),
  t("daily-heart-rate-zones", "daily", "activity_and_fitness", "The user's heart rate zones per day."),
  t("daily-vo2-max", "daily", "activity_and_fitness", "Daily VO2 max estimate."),
  t("exercise", "session", "activity_and_fitness", "Exercise sessions with type, duration and summary metrics."),
  t("run-vo2-max", "sample", "activity_and_fitness", "VO2 max estimated from runs.", "both"),
  t("vo2-max", "sample", "activity_and_fitness", "VO2 max samples."),
  t("heart-rate", "sample", "health_metrics_and_measurements", "Heart rate samples (bpm). Roll-ups cover at most 14 days.", "both"),
  t("heart-rate-variability", "sample", "health_metrics_and_measurements", "Heart rate variability samples."),
  t("oxygen-saturation", "sample", "health_metrics_and_measurements", "Blood oxygen saturation samples."),
  t("respiratory-rate-sleep-summary", "sample", "health_metrics_and_measurements", "Respiratory rate during sleep."),
  t("weight", "sample", "health_metrics_and_measurements", "Body weight measurements.", "both"),
  t("body-fat", "sample", "health_metrics_and_measurements", "Body fat measurements.", "both"),
  t("blood-glucose", "sample", "health_metrics_and_measurements", "Blood glucose measurements.", "both"),
  t("core-body-temperature", "sample", "health_metrics_and_measurements", "Core body temperature measurements.", "both"),
  t("height", "sample", "health_metrics_and_measurements", "Height measurements."),
  t("daily-resting-heart-rate", "daily", "health_metrics_and_measurements", "Resting heart rate per day."),
  t("daily-heart-rate-variability", "daily", "health_metrics_and_measurements", "Heart rate variability per day."),
  t("daily-oxygen-saturation", "daily", "health_metrics_and_measurements", "Blood oxygen saturation per day."),
  t("daily-respiratory-rate", "daily", "health_metrics_and_measurements", "Respiratory rate per day."),
  t("daily-sleep-temperature-derivations", "daily", "health_metrics_and_measurements", "Skin temperature variation during sleep, per day."),
  t("sleep", "session", "sleep", "Sleep sessions with start, end, stages and summary. At most 25 per page."),
  t("nutrition-log", "session", "nutrition", "Logged meals and foods. Only entries written by Health AI can be read back.", "both", {
    writable: true,
    writeFields: {
      required: [SESSION_INTERVAL, "foodDisplayName (anonymous food) or food (a Food resource name)"],
      optional: [
        "mealType: BREAKFAST | LUNCH | DINNER | SNACK | ANYTIME | …",
        "energy: {kcal}", "energyFromFat: {kcal}", "totalCarbohydrate: {grams}", "totalFat: {grams}",
        "nutrients: [{nutrient: e.g. DIETARY_FIBER | CAFFEINE | CALCIUM, quantity: {grams}}]",
        "serving: {amount, foodMeasurementUnit}",
      ],
      example: {
        interval: { startTime: "2026-09-26T12:30:00Z", endTime: "2026-09-26T12:45:00Z", startUtcOffset: "7200s", endUtcOffset: "7200s" },
        mealType: "LUNCH",
        foodDisplayName: "Chicken salad",
        energy: { kcal: 420 },
        totalCarbohydrate: { grams: 18 },
        totalFat: { grams: 22 },
      },
    },
  }),
  t("hydration-log", "session", "nutrition", "Logged drinks (water). Only entries written by Health AI can be read back.", "both", {
    writable: true,
    writeFields: {
      required: [SESSION_INTERVAL, "amountConsumed: {milliliters}"],
      optional: ["amountConsumed.userProvidedUnit: LITER | MILLILITER | CUP_US | …"],
      example: {
        interval: { startTime: "2026-09-26T09:00:00Z", endTime: "2026-09-26T09:00:00Z", startUtcOffset: "7200s", endUtcOffset: "7200s" },
        amountConsumed: { milliliters: 250 },
      },
    },
  }),
  t("moods", "sample", "mindfulness", "Logged moods."),
  t("symptoms", "sample", "logged_symptoms", "Logged symptoms."),
  t("menstrual-period", "interval", "reproductive_health", "Menstrual periods."),
  t("ovulation-test", "sample", "reproductive_health", "Ovulation test results."),
  t("electrocardiogram", "session", "ecg", "ECG readings. Only a start time can be filtered."),
  t("irregular-rhythm-notification", "session", "irn", "Irregular rhythm notifications."),
];

const BY_ID = new Map(DATA_TYPES.map((d) => [d.id, d]));

export function findDataType(id: string): DataType | undefined {
  return BY_ID.get(id);
}

/** `nutrition-log` → `nutritionLog`: the DataPoint field that carries the type's payload. */
export function payloadField(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
}

/** `daily-heart-rate-variability` → `daily_heart_rate_variability`: the name used in list filters. */
export function filterName(id: string): string {
  return id.replace(/-/g, "_");
}

export const GOOGLE_HEALTH_SCOPE_PREFIX = "https://www.googleapis.com/auth/googlehealth.";

export interface Access {
  readable: boolean;
  /** True when only the write scope was granted: reads return Health AI's own entries only. */
  ownEntriesOnly: boolean;
  writable: boolean;
  reason?: string;
}

/** What the user's granted Google scopes allow for one data type. */
export function accessFor(type: DataType, grantedScopes: readonly string[]): Access {
  const has = (s: string) => grantedScopes.includes(GOOGLE_HEALTH_SCOPE_PREFIX + s);
  const read = has(`${type.category}.readonly`);
  const write = has(`${type.category}.writeonly`);
  const reasons: string[] = [];
  if (!read && !write) reasons.push(`the ${type.category} permission was not granted`);
  if (type.writable && !write) reasons.push(`writing needs the ${type.category} write permission, which was not granted`);
  if (!type.writable) reasons.push("Health AI does not write this type");
  return {
    readable: read || write,
    ownEntriesOnly: !read && write,
    writable: type.writable && write,
    ...(reasons.length ? { reason: reasons.join("; ") } : {}),
  };
}
