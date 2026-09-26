// Tasks 4.7 and 4b.4 · IF-01m3eb1cqb3yah1ydzbas3hvar (delete_my_data tool),
// BR-01m3ec2jxj4979r5rs0ttmqgc8 (Insight records are protected)
import { afterEach, describe, expect, it } from "vitest";
import { connectMcp, makeTestApp, signIn, TESTER } from "../helpers.js";

const conns: Awaited<ReturnType<typeof connectMcp>>[] = [];
afterEach(async () => {
  for (const c of conns.splice(0)) await c.close();
});

async function setup() {
  const t = makeTestApp();
  const owner = await signIn(t, "g-owner");
  const tester = await signIn(t, "g-tester", TESTER);
  const c = await connectMcp(t, tester.token.body.access_token);
  const o = await connectMcp(t, owner.token.body.access_token);
  conns.push(c, o);
  await c.call("send_feedback", { message: "tester feedback", source: "user", kind: "other", intent: "pass it on" });
  await o.call("send_feedback", { message: "owner feedback", source: "user", kind: "other" });
  return { t, tester, c };
}

describe("delete_my_data", () => {
  it("without confirmation nothing is deleted and the result says why", async () => {
    const { t, c } = await setup();
    const r = await c.call("delete_my_data");
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/confirmation is required/);
    expect(t.store.users.has("sub-tester")).toBe(true);
    expect(t.google.revoked).toEqual([]);
  });

  it("revokes Google access, deletes the user's records and invalidates the old token", async () => {
    const { t, tester, c } = await setup();
    const r = await c.call("delete_my_data", { confirm: true, intent: "the user asked to delete their data" });
    expect(r.isError).toBe(false);
    expect(t.google.revoked).toEqual(["google-refresh-tester"]);

    expect(t.store.users.has("sub-tester")).toBe(false);
    const all = [
      ...t.store.grants.values(), ...t.store.refreshTokens.values(), ...t.store.authCodes.values(),
      ...t.store.feedback.values(), ...t.store.intents.values(),
    ] as { userId: string }[];
    expect(all.filter((x) => x.userId === "sub-tester")).toEqual([]);
    // The owner's records are untouched.
    expect([...t.store.feedback.values()].map((f) => f.message)).toEqual(["owner feedback"]);
    expect(t.store.users.has("sub-owner")).toBe(true);

    const mcp = await t.http.post("/mcp").set("authorization", `Bearer ${tester.token.body.access_token}`).send({});
    expect(mcp.status).toBe(401);
    const refresh = await t.http.post("/token").type("form").send({
      grant_type: "refresh_token", client_id: tester.clientId, refresh_token: tester.token.body.refresh_token,
    });
    expect(refresh.status).toBe(400);
  });

  it("still deletes when Google cannot be reached, and tells the user where to revoke", async () => {
    const { t, c } = await setup();
    t.google.revoke = async () => {
      throw new Error("network");
    };
    const r = await c.call("delete_my_data", { confirm: true });
    expect(r.isError).toBe(false);
    expect(r.text).toContain("myaccount.google.com/permissions");
    expect(t.store.users.has("sub-tester")).toBe(false);
  });
});
