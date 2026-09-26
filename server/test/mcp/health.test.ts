// Tasks 4.2–4.6 and part of 4.8 · BR-01m3eb1f9dyg49jbzkw0ke8k6d (Resource-oriented tool set),
// BR-01m3eb1fm9kjbng60zvjgc34yn (Thin mapping without domain logic), BR-01m3eb1c4j4hc489jbay9ncwhx (Actionable tool errors),
// BR-01m3eb1hj8n8qg0q5kevtqnda8 (Tool annotations), IF-01m3eb1fytpbacz2b3vfnsjrjw (list_data_types tool),
// IF-01m3eb1g9r4bt0fvmyf568svj5 (read_data tool), IF-01m3eb1gm40cg5a4wsfgzrb0xb (aggregate_data tool),
// IF-01m3eb1gy6aa3z553154dgycdd (write_data, update_data and delete_data tools), IF-01m3eb1h8hhcepg1fkb4kk5chw (get_profile and list_devices tools)
//
// The Health API answers below follow the discovery document's schemas; real recorded responses replace
// them once task 1.2 has run against the owner's account.
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectMcp, makeTestApp, READ_SCOPES, signIn, type TestApp } from "../helpers.js";

const conns: Awaited<ReturnType<typeof connectMcp>>[] = [];
afterEach(async () => {
  for (const c of conns.splice(0)) await c.close();
  vi.restoreAllMocks();
});

async function connect(t: TestApp, over: Parameters<typeof signIn>[2] = {}) {
  const { token } = await signIn(t, "g-code", over);
  const c = await connectMcp(t, token.body.access_token);
  conns.push(c);
  return c;
}

const json = (text: string) => JSON.parse(text) as Record<string, unknown>;

describe("list_data_types (4.2)", () => {
  it("states readable and writable per type from the granted scopes", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const types = json((await c.call("list_data_types")).text)["dataTypes"] as Record<string, unknown>[];
    const byId = (id: string) => types.find((x) => x["id"] === id) ?? {};
    expect(byId("sleep")).toMatchObject({ readable: true, writable: false });
    expect(byId("nutrition-log")).toMatchObject({ readable: true, writable: true, readableScope: "only entries written by Health AI" });
    expect((byId("nutrition-log")["writeFields"] as { required: string[] }).required.join(" ")).toMatch(/foodDisplayName/);
    expect(byId("moods")).toMatchObject({ readable: false, writable: false });
    expect(byId("steps")["aggregations"]).toEqual(["hour", "day", "week"]);
    expect(byId("sleep")["aggregations"]).toEqual([]);
  });

  it("lists a writable type as not writable, with the reason, when the write scope is missing", async () => {
    const t = makeTestApp();
    const c = await connect(t, { grantedScopes: ["openid", "email", ...READ_SCOPES] });
    const types = json((await c.call("list_data_types")).text)["dataTypes"] as Record<string, unknown>[];
    const nutrition = types.find((x) => x["id"] === "hydration-log") ?? {};
    expect(nutrition).toMatchObject({ readable: false, writable: false });
    expect(String(nutrition["reason"])).toMatch(/nutrition write permission/);
    const r = await c.call("write_data", { data_type: "hydration-log", data: { amountConsumed: { milliliters: 250 } } });
    expect(r.isError).toBe(true);
    expect(t.health.requests).toHaveLength(0);
  });
});

describe("read_data (4.3)", () => {
  it("reads last night's sleep by local end time and passes the result through", async () => {
    const t = makeTestApp();
    const sleep = { sleep: { interval: { startTime: "2026-09-25T21:40:00Z", endTime: "2026-09-26T05:10:00Z" }, stages: [] } };
    t.health.handler = () => ({ json: { dataPoints: [sleep] } });
    const c = await connect(t);
    const r = await c.call("read_data", { data_type: "sleep", start: "2026-09-26", end: "2026-09-27", intent: "how did I sleep" });
    expect(r.isError).toBe(false);
    const req = t.health.last();
    expect(req.method).toBe("GET");
    expect(req.url.pathname).toBe("/v4/users/me/dataTypes/sleep/dataPoints");
    expect(req.url.searchParams.get("filter")).toBe('sleep.interval.civil_end_time >= "2026-09-26" AND sleep.interval.civil_end_time < "2026-09-27"');
    expect(req.auth).toMatch(/^Bearer google-at-/);
    expect(json(r.text)).toEqual({ dataType: "sleep", dataPoints: [sleep], nextPageToken: null });
  });

  it("uses physical time for timestamps with an offset, and per-kind filter fields", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    await c.call("read_data", { data_type: "steps", start: "2026-09-25T00:00:00+02:00", end: "2026-09-26T00:00:00+02:00" });
    expect(t.health.last().url.searchParams.get("filter"))
      .toBe('steps.interval.start_time >= "2026-09-24T22:00:00.000Z" AND steps.interval.start_time < "2026-09-25T22:00:00.000Z"');
    await c.call("read_data", { data_type: "heart-rate", start: "2026-09-25T08:00", end: "2026-09-25T09:00" });
    expect(t.health.last().url.searchParams.get("filter"))
      .toBe('heart_rate.sample_time.civil_time >= "2026-09-25T08:00:00" AND heart_rate.sample_time.civil_time < "2026-09-25T09:00:00"');
    await c.call("read_data", { data_type: "daily-resting-heart-rate", start: "2026-09-01", end: "2026-09-08" });
    expect(t.health.last().url.searchParams.get("filter"))
      .toBe('daily_resting_heart_rate.date >= "2026-09-01" AND daily_resting_heart_rate.date < "2026-09-08"');
  });

  it("returns one page and a token that fetches the next", async () => {
    const t = makeTestApp();
    t.health.handler = ({ url }) => (url.searchParams.get("pageToken") === "p2"
      ? { json: { dataPoints: [{ steps: { count: "2" } }] } }
      : { json: { dataPoints: [{ steps: { count: "1" } }], nextPageToken: "p2" } });
    const c = await connect(t);
    const first = json((await c.call("read_data", { data_type: "steps", start: "2026-09-25", end: "2026-09-26", page_size: 1 })).text);
    expect(first["nextPageToken"]).toBe("p2");
    expect(t.health.last().url.searchParams.get("pageSize")).toBe("1");
    const second = json((await c.call("read_data", { data_type: "steps", start: "2026-09-25", end: "2026-09-26", page_size: 1, page_token: "p2" })).text);
    expect(second).toMatchObject({ dataPoints: [{ steps: { count: "2" } }], nextPageToken: null });
  });

  it("names the invalid argument and sends nothing upstream", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const cases: [Record<string, unknown>, RegExp][] = [
      [{ data_type: "steps", start: "2026-09-26", end: "2026-09-25" }, /`end`/],
      [{ data_type: "stepz", start: "2026-09-25", end: "2026-09-26" }, /`data_type`/],
      [{ data_type: "steps", start: "yesterday", end: "2026-09-26" }, /`start`/],
      [{ data_type: "steps", start: "2026-09-25", end: "2026-09-26T00:00:00Z" }, /`end`/],
      [{ data_type: "daily-resting-heart-rate", start: "2026-09-25T00:00:00Z", end: "2026-09-26T00:00:00Z" }, /daily type/],
    ];
    for (const [args, message] of cases) {
      const r = await c.call("read_data", args);
      expect(r.isError, JSON.stringify(args)).toBe(true);
      expect(r.text).toMatch(message);
    }
    expect(t.health.requests).toHaveLength(0);
  });
});

describe("aggregate_data (4.4)", () => {
  it("seven days of daily steps returns seven buckets", async () => {
    const t = makeTestApp();
    const buckets = Array.from({ length: 7 }, (_, i) => ({
      civilStartTime: { date: { year: 2026, month: 9, day: 19 + i } },
      civilEndTime: { date: { year: 2026, month: 9, day: 20 + i } },
      steps: { countSum: String(8000 + i) },
    }));
    t.health.handler = () => ({ json: { rollupDataPoints: buckets } });
    const c = await connect(t);
    const r = await c.call("aggregate_data", { data_type: "steps", bucket: "day", start: "2026-09-19", end: "2026-09-26" });
    const req = t.health.last();
    expect(req.method).toBe("POST");
    expect(req.url.pathname).toBe("/v4/users/me/dataTypes/steps/dataPoints:dailyRollUp");
    expect(req.body).toEqual({
      range: { start: { date: { year: 2026, month: 9, day: 19 } }, end: { date: { year: 2026, month: 9, day: 26 } } },
      windowSizeDays: 1,
    });
    expect((json(r.text)["buckets"] as unknown[]).length).toBe(7);
  });

  it("weeks use 7-day windows and hours use physical roll-ups", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    await c.call("aggregate_data", { data_type: "steps", bucket: "week", start: "2026-09-05", end: "2026-09-26" });
    expect((t.health.last().body as { windowSizeDays: number }).windowSizeDays).toBe(7);
    await c.call("aggregate_data", { data_type: "heart-rate", bucket: "hour", start: "2026-09-25T00:00:00Z", end: "2026-09-26T00:00:00Z" });
    expect(t.health.last().url.pathname).toBe("/v4/users/me/dataTypes/heart-rate/dataPoints:rollUp");
    expect(t.health.last().body).toEqual({ range: { startTime: "2026-09-25T00:00:00.000Z", endTime: "2026-09-26T00:00:00.000Z" }, windowSize: "3600s" });
  });

  it("types without aggregation point to read_data", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const r = await c.call("aggregate_data", { data_type: "sleep", bucket: "day", start: "2026-09-19", end: "2026-09-26" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/read_data/);
    expect(t.health.requests).toHaveLength(0);
  });
});

describe("write_data, update_data, delete_data (4.5)", () => {
  const meal = {
    interval: { startTime: "2026-09-26T10:30:00Z", endTime: "2026-09-26T10:45:00Z", startUtcOffset: "7200s", endUtcOffset: "7200s" },
    mealType: "LUNCH",
    foodDisplayName: "Chicken salad",
    energy: { kcal: 420 },
  };

  it("sends the values unchanged and returns the upstream id", async () => {
    const t = makeTestApp();
    t.health.handler = ({ body }) => ({ json: { name: "operations/op-1", done: true, response: body } });
    const c = await connect(t);
    const r = json((await c.call("write_data", { data_type: "nutrition-log", data: meal, intent: "log lunch" })).text);
    const req = t.health.last();
    expect(req.url.pathname).toBe("/v4/users/me/dataTypes/nutrition-log/dataPoints");
    expect(req.body).toEqual({ name: `users/me/dataTypes/nutrition-log/dataPoints/${String(r["id"])}`, nutritionLog: meal });
    expect(String(r["id"])).toMatch(/^hai-[a-z0-9-]{36}$/);
  });

  it("updates and deletes by id or by data point name, always under users/me", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    await c.call("update_data", { data_type: "nutrition-log", id: "users/123456/dataTypes/nutrition-log/dataPoints/abcd-1234", data: { ...meal, energy: { kcal: 380 } } });
    expect(t.health.last().method).toBe("PATCH");
    expect(t.health.last().url.pathname).toBe("/v4/users/me/dataTypes/nutrition-log/dataPoints/abcd-1234");
    expect((t.health.last().body as { nutritionLog: { energy: unknown } }).nutritionLog.energy).toEqual({ kcal: 380 });
    await c.call("delete_data", { data_type: "nutrition-log", ids: ["abcd-1234", "hai-5678"] });
    expect(t.health.last().url.pathname).toBe("/v4/users/me/dataTypes/nutrition-log/dataPoints:batchDelete");
    expect(t.health.last().body).toEqual({
      names: ["users/me/dataTypes/nutrition-log/dataPoints/abcd-1234", "users/me/dataTypes/nutrition-log/dataPoints/hai-5678"],
    });
  });

  it("rejects ids of another type and writes to read-only types without calling upstream", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const wrongType = await c.call("delete_data", { data_type: "nutrition-log", ids: ["users/1/dataTypes/sleep/dataPoints/abcd"] });
    expect(wrongType.isError).toBe(true);
    const readOnly = await c.call("write_data", { data_type: "sleep", data: {} });
    expect(readOnly.isError).toBe(true);
    expect(readOnly.text).toMatch(/does not write this type/);
    expect(t.health.requests).toHaveLength(0);
  });
});

describe("get_profile and list_devices (4.6)", () => {
  it("returns profile with settings, and paired devices", async () => {
    const t = makeTestApp();
    t.health.handler = ({ url }) => {
      if (url.pathname.endsWith("/profile")) return { json: { name: "users/me/profile", age: 41 } };
      if (url.pathname.endsWith("/settings")) return { json: { timeZone: "Europe/Budapest", weightUnit: "WEIGHT_UNIT_KILOGRAM" } };
      return { json: { pairedDevices: [{ deviceType: "TRACKER", deviceVersion: "Fitbit Air", lastSyncTime: "2026-09-26T06:02:00Z", batteryLevel: 71 }] } };
    };
    const c = await connect(t);
    expect(json((await c.call("get_profile")).text)).toEqual({
      profile: { name: "users/me/profile", age: 41 },
      settings: { timeZone: "Europe/Budapest", weightUnit: "WEIGHT_UNIT_KILOGRAM" },
    });
    const devices = json((await c.call("list_devices")).text)["devices"] as Record<string, unknown>[];
    expect(devices[0]).toMatchObject({ deviceVersion: "Fitbit Air", lastSyncTime: "2026-09-26T06:02:00Z" });
  });
});

describe("annotations and upstream errors (4.8)", () => {
  it("marks read-only and destructive tools", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const tools = new Map((await c.client.listTools()).tools.map((x) => [x.name, x.annotations ?? {}]));
    for (const name of ["read_data", "aggregate_data", "list_data_types", "get_profile", "list_devices"]) {
      expect(tools.get(name)?.readOnlyHint, name).toBe(true);
    }
    for (const name of ["delete_data", "delete_my_data"]) expect(tools.get(name)?.destructiveHint, name).toBe(true);
  });

  it("turns validation and rate-limit errors into readable tool errors, without values in the logs", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    t.health.handler = () => ({ status: 400, json: { error: { code: 400, status: "INVALID_ARGUMENT", message: "energy.kcal must be at most 100000" } } });
    const bad = await c.call("write_data", { data_type: "nutrition-log", data: { foodDisplayName: "Chicken salad", energy: { kcal: 999999 } } });
    expect(bad).toMatchObject({ isError: true });
    expect(bad.text).toMatch(/rejected the request as invalid.*energy.kcal must be at most 100000/);
    t.health.handler = () => ({ status: 429, json: { error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "quota" } } });
    const limited = await c.call("read_data", { data_type: "steps", start: "2026-09-25", end: "2026-09-26" });
    expect(limited.text).toMatch(/rate limited.*retry/i);
    const lines = log.mock.calls.flat().join("\n");
    expect(lines).toContain('"upstreamStatus":400');
    expect(lines).not.toContain("Chicken salad");
    expect(lines).not.toContain("999999");
    expect(lines).not.toContain("google-at-");
  });
});
