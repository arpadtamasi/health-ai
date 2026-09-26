// Tasks 4b.1–4b.3 · BR-01m3ec2jjaqp80zks6pseeh1xg (Every tool call states its intent),
// IF-01m3ec2hvdh0e2j8fs6n0xrgst (send_feedback tool), BR-01m3ecxdq6nqjjejph3j93jws4 (Agents are asked to report friction),
// IF-01m3ec2j6wkazgfenh95w6mn4b (list_feedback and usage_summary tools), BR-01m3ec2jxj4979r5rs0ttmqgc8 (Insight records are protected)
import { afterEach, describe, expect, it, vi } from "vitest";
import { INSIGHT_RETENTION_MS } from "../../src/mcp/retention.js";
import { connectMcp, makeTestApp, signIn, TESTER, type TestApp } from "../helpers.js";

const conns: Awaited<ReturnType<typeof connectMcp>>[] = [];
afterEach(async () => {
  for (const c of conns.splice(0)) await c.close();
  vi.restoreAllMocks();
});

async function connect(t: TestApp, as: "owner" | "tester" = "owner") {
  const { token } = await signIn(t, `g-${as}`, as === "tester" ? TESTER : {});
  const c = await connectMcp(t, token.body.access_token);
  conns.push(c);
  return c;
}

const feedback = { message: "Needed three reads for one night", source: "agent", kind: "too_many_calls", tools: ["read_data", "aggregate_data"] };

describe("intents", () => {
  it("a call with an intent is executed and the intent recorded", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const r = await c.call("send_feedback", { ...feedback, intent: "the user asked how they slept last night" });
    expect(r.isError).toBe(false);
    const [rec] = [...t.store.intents.values()];
    expect(rec).toMatchObject({ userId: "sub-owner", tool: "send_feedback", intent: "the user asked how they slept last night" });
    expect(rec?.expireAt).toBe((rec?.createdAt ?? 0) + INSIGHT_RETENTION_MS);
  });

  it("a call without an intent still runs and records the missing intent", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const r = await c.call("send_feedback", feedback);
    expect(r.isError).toBe(false);
    expect(t.store.feedback.size).toBe(1);
    expect([...t.store.intents.values()][0]).toMatchObject({ tool: "send_feedback", intent: null });
  });

  it("logs contain neither intent nor feedback text", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await c.call("send_feedback", { ...feedback, intent: "secret-intent-text" });
    const lines = [...log.mock.calls, ...err.mock.calls].flat().join("\n");
    expect(lines).toContain("tool_call");
    expect(lines).not.toContain("secret-intent-text");
    expect(lines).not.toContain(feedback.message);
    expect(lines).not.toContain("sub-owner");
  });
});

describe("send_feedback", () => {
  it("stores user feedback with source, user and time, and confirms it", async () => {
    const t = makeTestApp({ now: () => 1_000_000 });
    const c = await connect(t);
    const r = await c.call("send_feedback", { message: "The sleep answer was confusing", source: "user", kind: "confusing" });
    expect(r.text).toMatch(/received/);
    expect([...t.store.feedback.values()][0]).toMatchObject({ source: "user", userId: "sub-owner", createdAt: 1_000_000, tools: [] });
  });

  it("stores agent feedback with the related tools and the too_many_calls kind", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    await c.call("send_feedback", feedback);
    expect([...t.store.feedback.values()][0]).toMatchObject({ source: "agent", kind: "too_many_calls", tools: ["read_data", "aggregate_data"] });
  });

  it("refuses an empty message and stores nothing", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const r = await c.call("send_feedback", { ...feedback, message: "   " });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/message is required/);
    expect(t.store.feedback.size).toBe(0);
  });

  it("instructions and tool description ask for friction reports without asking the user", async () => {
    const t = makeTestApp();
    const c = await connect(t);
    const tool = (await c.client.listTools()).tools.find((x) => x.name === "send_feedback");
    for (const text of [c.client.getInstructions() ?? "", tool?.description ?? ""]) {
      expect(text).toMatch(/more calls than/);
      expect(text).toMatch(/too_many_calls/);
      expect(text).toMatch(/without asking the user first/);
    }
  });
});

describe("owner-only insight tools", () => {
  it("the owner sees them; a tester neither lists nor calls them", async () => {
    const t = makeTestApp();
    const owner = await connect(t, "owner");
    const tester = await connect(t, "tester");
    const ownerTools = (await owner.client.listTools()).tools.map((x) => x.name);
    const testerTools = (await tester.client.listTools()).tools.map((x) => x.name);
    expect(ownerTools).toEqual(expect.arrayContaining(["list_feedback", "usage_summary"]));
    expect(testerTools).not.toContain("list_feedback");
    expect(testerTools).not.toContain("usage_summary");
    const r = await tester.call("list_feedback");
    expect(r.isError).toBe(true);
  });

  it("list_feedback returns all users' feedback newest first, pseudonymous", async () => {
    let clock = Date.parse("2026-09-20T10:00:00Z");
    const t = makeTestApp({ now: () => clock });
    const owner = await connect(t, "owner");
    const tester = await connect(t, "tester");
    await tester.call("send_feedback", { message: "first", source: "user", kind: "bug", tools: ["read_data"] });
    clock += 60_000;
    await owner.call("send_feedback", { message: "second", source: "agent", kind: "other" });
    const r = await owner.call("list_feedback");
    const body = JSON.parse(r.text) as { feedback: { message: string; user: string; source: string; tools: string[]; at: string }[] };
    expect(body.feedback.map((f) => f.message)).toEqual(["second", "first"]);
    expect(body.feedback[0]?.user).toBe("you");
    expect(body.feedback[1]).toMatchObject({ source: "user", tools: ["read_data"], at: "2026-09-20T10:00:00.000Z" });
    expect(r.text).not.toContain("tester@example.com");
    expect(r.text).not.toContain("sub-tester");
  });

  it("usage_summary counts calls per tool and lists intents for the period", async () => {
    let clock = Date.parse("2026-09-20T10:00:00Z");
    const t = makeTestApp({ now: () => clock });
    const owner = await connect(t, "owner");
    await owner.call("send_feedback", { ...feedback, intent: "report friction" });
    await owner.call("send_feedback", feedback);
    clock += 60_000;
    const r = await owner.call("usage_summary", { intent: "weekly review" });
    const body = JSON.parse(r.text) as { callsPerTool: Record<string, number>; callsWithoutIntent: number; intents: { intent: string }[] };
    expect(body.callsPerTool).toEqual({ send_feedback: 2, usage_summary: 1 });
    expect(body.callsWithoutIntent).toBe(1);
    expect(body.intents.map((i) => i.intent).sort()).toEqual(["(intent missing)", "report friction", "weekly review"]);
  });

  it("an invalid time range names the argument", async () => {
    const t = makeTestApp();
    const owner = await connect(t, "owner");
    const r = await owner.call("usage_summary", { from: "yesterday-ish" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/`from`/);
  });
});
