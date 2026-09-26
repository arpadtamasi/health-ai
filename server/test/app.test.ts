import { describe, expect, it } from "vitest";
import { makeTestApp } from "./helpers.js";

describe("http app", () => {
  it("answers the health check", async () => {
    const res = await makeTestApp().http.get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns 404 for unknown routes", async () => {
    const res = await makeTestApp().http.get("/nope");
    expect(res.status).toBe(404);
  });
});
