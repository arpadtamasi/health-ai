/** Base of every Health AI request: the signed-in user is always `users/me`. */
export const HEALTH_API_BASE = "https://health.googleapis.com/v4/users/me/";

/** A non-2xx answer from the Google Health API. */
export class HealthApiError extends Error {
  constructor(
    readonly status: number,
    readonly upstreamStatus: string,
    readonly upstreamMessage: string,
  ) {
    super(`Google Health API ${status} ${upstreamStatus}`);
    this.name = "HealthApiError";
  }
}

export type Fetch = typeof fetch;
type Json = Record<string, unknown>;

/**
 * A thin client over the Google Health API v4 (docs/google-health-api.md). It sends requests as
 * given and returns the JSON as received: BR-01m3eb1fm9kjbng60zvjgc34yn (Thin mapping without
 * domain logic).
 */
export class HealthApi {
  constructor(
    private readonly accessToken: () => Promise<string>,
    private readonly fetchImpl: Fetch = fetch,
  ) {}

  listDataPoints(type: string, q: { filter?: string; pageSize?: number; pageToken?: string }) {
    return this.call("GET", `dataTypes/${type}/dataPoints`, { query: q });
  }
  rollUp(type: string, body: Json) {
    return this.call("POST", `dataTypes/${type}/dataPoints:rollUp`, { body });
  }
  dailyRollUp(type: string, body: Json) {
    return this.call("POST", `dataTypes/${type}/dataPoints:dailyRollUp`, { body });
  }
  createDataPoint(type: string, body: Json) {
    return this.call("POST", `dataTypes/${type}/dataPoints`, { body });
  }
  patchDataPoint(type: string, id: string, body: Json) {
    return this.call("PATCH", `dataTypes/${type}/dataPoints/${id}`, { body });
  }
  batchDelete(type: string, names: string[]) {
    return this.call("POST", `dataTypes/${type}/dataPoints:batchDelete`, { body: { names } });
  }
  getProfile() {
    return this.call("GET", "profile");
  }
  getSettings() {
    return this.call("GET", "settings");
  }
  listPairedDevices() {
    return this.call("GET", "pairedDevices");
  }

  private async call(method: string, path: string, opts: { query?: Record<string, string | number | undefined>; body?: Json } = {}): Promise<Json> {
    const url = new URL(path, HEALTH_API_BASE);
    for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    const res = await this.fetchImpl(url, {
      method,
      headers: {
        authorization: `Bearer ${await this.accessToken()}`,
        ...(opts.body ? { "content-type": "application/json" } : {}),
      },
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    });
    const text = await res.text();
    const json = text ? (JSON.parse(text) as Json) : {};
    if (!res.ok) {
      const err = (json["error"] ?? {}) as { status?: string; message?: string };
      throw new HealthApiError(res.status, err.status ?? "", err.message ?? res.statusText);
    }
    return json;
  }
}

/** A readable tool error for an upstream failure: BR-01m3eb1c4j4hc489jbay9ncwhx (Actionable tool errors). */
export function describeHealthApiError(err: HealthApiError): string {
  const reason = err.upstreamMessage ? ` Google said: ${err.upstreamMessage}` : "";
  if (err.status === 429) return "Google Health rate limited the request. Wait a minute, then retry.";
  if (err.status === 400) return `Google Health rejected the request as invalid.${reason} Fix the arguments and retry.`;
  if (err.status === 401) return "Google Health did not accept the access token. Retry once; if it fails again, the user should reconnect Health AI.";
  if (err.status === 403) {
    return `Google Health refused access.${reason} The user may not have granted this permission; they can reconnect Health AI and allow it.`;
  }
  if (err.status === 404) return `Google Health could not find it.${reason}`;
  if (err.status >= 500) return `Google Health is unavailable right now (HTTP ${err.status}). Try again later.`;
  return `Google Health returned HTTP ${err.status}.${reason}`;
}
