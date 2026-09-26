import { describe, expect, it } from "vitest";
import { makeTestApp } from "./helpers.js";

describe("http app", () => {
  it.each(["/health", "/healthz"])("answers the health check at %s", async (path) => {
    const res = await makeTestApp().http.get(path);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("serves the landing page with the MCP URL at /", async () => {
    const res = await makeTestApp().http.get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("http://localhost:8080/mcp");
    expect(res.text).toContain("Meals and water you log");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await makeTestApp().http.get("/nope");
    expect(res.status).toBe(404);
  });
});
