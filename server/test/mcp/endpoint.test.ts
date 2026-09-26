// Task 4.1 · IF-01m3eb1b7edb7e1dh0rft2dq63 (MCP endpoint)
import { afterEach, describe, expect, it } from "vitest";
import { connectMcp, makeTestApp, signIn, TESTER } from "../helpers.js";

type Conn = Awaited<ReturnType<typeof connectMcp>>;
let conn: Conn | undefined;
afterEach(async () => {
  await conn?.close();
  conn = undefined;
});

describe("MCP endpoint", () => {
  it("initialize returns server info, instructions and the tools capability", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t);
    conn = await connectMcp(t, token.body.access_token);
    expect(conn.client.getServerVersion()?.name).toBe("health-ai");
    expect(conn.client.getServerCapabilities()?.tools).toBeDefined();
    expect(conn.client.getInstructions()).toContain("send_feedback");
  });

  it("tools/list works with a valid token", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t);
    conn = await connectMcp(t, token.body.access_token);
    const names = (await conn.client.listTools()).tools.map((x) => x.name);
    expect(names).toEqual(expect.arrayContaining(["send_feedback", "delete_my_data"]));
  });

  it("every tool accepts an intent argument", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t);
    conn = await connectMcp(t, token.body.access_token);
    for (const tool of (await conn.client.listTools()).tools) {
      expect(Object.keys(tool.inputSchema.properties ?? {}), tool.name).toContain("intent");
    }
  });

  it("GET is not allowed on the stateless endpoint", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t, "g-code", TESTER);
    const res = await t.http.get("/mcp").set("authorization", `Bearer ${token.body.access_token}`);
    expect(res.status).toBe(405);
  });

  it("a token whose user record is gone gets 401", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t);
    t.store.users.clear();
    const res = await t.http.post("/mcp").set("authorization", `Bearer ${token.body.access_token}`).send({});
    expect(res.status).toBe(401);
  });
});
