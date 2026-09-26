// Task 3.5 · BR-01m3eb1bh5h0gad7vmdj01xfc6 (Every MCP request is authenticated)
import { describe, expect, it } from "vitest";
import { makeTestApp, signIn } from "../helpers.js";

describe("bearer authentication on /mcp", () => {
  it("missing token: 401 pointing at the protected resource metadata", async () => {
    const res = await makeTestApp().http.post("/mcp");
    expect(res.status).toBe(401);
    expect(res.headers["www-authenticate"]).toContain(
      'resource_metadata="http://localhost:8080/.well-known/oauth-protected-resource/mcp"',
    );
  });

  it("valid token passes authentication", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t);
    const res = await t.http.post("/mcp").set("authorization", `Bearer ${token.body.access_token}`);
    expect(res.status).not.toBe(401);
  });

  it("expired token: 401", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t);
    const grantId = [...t.store.grants.keys()][0] ?? "";
    const expired = await t.tokens.sign({ userId: "sub-owner", clientId: "c", grantId, scopes: ["health.read"] }, -10);
    expect(token.status).toBe(200);
    const res = await t.http.post("/mcp").set("authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it("revoked token: 401", async () => {
    const t = makeTestApp();
    const { clientId, token } = await signIn(t);
    const rev = await t.http.post("/revoke").type("form").send({ client_id: clientId, token: token.body.refresh_token });
    expect(rev.status).toBe(200);
    const res = await t.http.post("/mcp").set("authorization", `Bearer ${token.body.access_token}`);
    expect(res.status).toBe(401);
  });

  it("forged token: 401", async () => {
    const res = await makeTestApp().http.post("/mcp").set("authorization", "Bearer abc.def.ghi");
    expect(res.status).toBe(401);
  });
});
