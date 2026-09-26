// Task 4.9 · every example call in docs/tools.md matches its tool's input schema, and every tool is documented.
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { connectMcp, makeTestApp, signIn } from "../helpers.js";

const doc = readFileSync(new URL("../../../docs/tools.md", import.meta.url), "utf8");
const examples = [...doc.matchAll(/```json (\w+)\n([\s\S]*?)```/g)].map((m) => ({
  tool: m[1] ?? "",
  args: JSON.parse(m[2] ?? "{}") as Record<string, unknown>,
}));

const conns: Awaited<ReturnType<typeof connectMcp>>[] = [];
afterEach(async () => {
  for (const c of conns.splice(0)) await c.close();
});

describe("docs/tools.md", () => {
  it("documents every tool the owner sees", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t);
    const c = await connectMcp(t, token.body.access_token);
    conns.push(c);
    const tools = (await c.client.listTools()).tools.map((x) => x.name);
    expect(new Set(examples.map((e) => e.tool))).toEqual(new Set(tools));
  });

  it.each(examples.map((e, i) => [`${i + 1}. ${e.tool}`, e] as const))("%s matches the input schema", async (_label, example) => {
    const t = makeTestApp();
    t.health.handler = () => ({ json: {} });
    const { token } = await signIn(t);
    const c = await connectMcp(t, token.body.access_token);
    conns.push(c);
    const r = await c.call(example.tool, example.args);
    expect(r.text).not.toMatch(/Input validation error|Invalid argument/);
    expect(r.isError, r.text).toBe(false);
  });
});
