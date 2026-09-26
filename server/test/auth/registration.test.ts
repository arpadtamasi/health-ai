// Task 3.2 · IF-01m3eb1dn2x3v6146zd227h8br (Client registration endpoint)
import { describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers.js";

const register = (uris: string[]) =>
  makeTestApp().http.post("/register").send({ redirect_uris: uris, token_endpoint_auth_method: "none" });

describe("dynamic client registration", () => {
  it.each([
    "https://claude.ai/api/mcp/auth_callback",
    "http://localhost:6274/callback",
    "http://127.0.0.1:33418/cb",
  ])("accepts %s", async (uri) => {
    const res = await register([uri]);
    expect(res.status).toBe(201);
    expect(res.body.client_id).toEqual(expect.any(String));
  });

  it.each(["http://example.com/cb", "myapp://callback", "ftp://example.com"])("rejects %s", async (uri) => {
    const res = await register([uri]);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_client_metadata");
  });
});
