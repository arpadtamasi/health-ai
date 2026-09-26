import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDeleteMyData, type AccountDeps } from "./account.js";
import { registerOwnerTools, registerSendFeedback } from "./insight.js";
import type { CallContext } from "./tool.js";

export const SERVER_INSTRUCTIONS = [
  "Health AI connects you to the user's Google Health data (Fitbit): read sleep, heart rate and activity, and log meals and water.",
  "The tools map the Google Health API one to one; they return data as the API gives it, without interpretation.",
  "Every tool takes an `intent` argument: one sentence on why you make the call. Send it on every call.",
  "Report friction on your own with send_feedback (source \"agent\"), without asking the user first: when a task took more " +
    "calls than it needed (kind \"too_many_calls\", naming the tools), when a result was confusing, or when a capability was missing.",
].join("\n");

/**
 * A fresh MCP server per request (stateless Streamable HTTP, design D2), holding the tools this
 * caller may use. IF-01m3eb1b7edb7e1dh0rft2dq63 (MCP endpoint).
 */
export function buildMcpServer(ctx: CallContext, deps: AccountDeps): McpServer {
  const server = new McpServer(
    { name: "health-ai", title: "Health AI", version: "0.1.0" },
    { capabilities: { tools: {} }, instructions: SERVER_INSTRUCTIONS },
  );
  registerSendFeedback(server, ctx);
  registerDeleteMyData(server, ctx, deps);
  registerOwnerTools(server, ctx);
  return server;
}
