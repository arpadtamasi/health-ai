// Task 3.1 · IF-01m3eb1dc1ps80f3fbg3ve5dv3 (OAuth discovery metadata)
import { describe, expect, it } from "vitest";
import { makeTestApp } from "../helpers.js";

describe("OAuth discovery metadata", () => {
  it("publishes authorization server metadata with S256 and both grants", async () => {
    const res = await makeTestApp().http.get("/.well-known/oauth-authorization-server");
    expect(res.status).toBe(200);
    expect(res.body.issuer).toBe("http://localhost:8080/");
    expect(res.body.authorization_endpoint).toBe("http://localhost:8080/authorize");
    expect(res.body.token_endpoint).toBe("http://localhost:8080/token");
    expect(res.body.registration_endpoint).toBe("http://localhost:8080/register");
    expect(res.body.grant_types_supported).toEqual(expect.arrayContaining(["authorization_code", "refresh_token"]));
    expect(res.body.code_challenge_methods_supported).toEqual(["S256"]);
  });

  it("publishes protected resource metadata naming the authorization server", async () => {
    const res = await makeTestApp().http.get("/.well-known/oauth-protected-resource/mcp");
    expect(res.status).toBe(200);
    expect(res.body.resource).toBe("http://localhost:8080/mcp");
    expect(res.body.authorization_servers).toEqual(["http://localhost:8080/"]);
    expect(res.body.scopes_supported).toEqual(["health.read", "health.write"]);
  });
});
