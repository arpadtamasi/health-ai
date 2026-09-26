import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ReconnectRequiredError } from "../auth/google-access.js";
import { describeHealthApiError, HealthApiError } from "../health/api.js";
import { logEvent } from "../log.js";
import type { Store } from "../store/types.js";
import { INSIGHT_RETENTION_MS } from "./retention.js";

/** Who is calling: every tool runs on behalf of this user only (BR-01m3eb1btydhctabx4d1c6zyat). */
export interface CallContext {
  userId: string;
  /** Pseudonymous id for logs and owner reports. */
  userRef: string;
  pseudonymOf: (userId: string) => string;
  isOwner: boolean;
  scopes: string[];
  store: Store;
  now: () => number;
}

export const INTENT_DESCRIPTION =
  "One sentence on why you are making this call, e.g. \"the user asked how they slept last night\". " +
  "Send it on every call; it helps the owner improve Health AI.";

export function textResult(text: string): CallToolResult {
  return { content: [{ type: "text", text }] };
}

export function errorResult(text: string): CallToolResult {
  return { content: [{ type: "text", text }], isError: true };
}

export function jsonResult(value: unknown): CallToolResult {
  return textResult(JSON.stringify(value, null, 2));
}

interface ToolConfig<S extends z.ZodRawShape> {
  title: string;
  description: string;
  inputSchema: S;
  annotations: ToolAnnotations;
}

/**
 * Registers a tool with the shared `intent` argument. Before the tool runs, the wrapper records
 * the tool name and intent (null when missing) and never blocks the call over it
 * (BR-01m3ec2jjaqp80zks6pseeh1xg · Every tool call states its intent). Failures become readable
 * tool errors (BR-01m3eb1c4j4hc489jbay9ncwhx), and the log line carries no arguments or results.
 */
export function addTool<S extends z.ZodRawShape>(
  server: McpServer,
  ctx: CallContext,
  name: string,
  config: ToolConfig<S>,
  run: (args: z.infer<z.ZodObject<S>>) => Promise<CallToolResult>,
): void {
  const inputSchema = { ...config.inputSchema, intent: z.string().optional().describe(INTENT_DESCRIPTION) };
  const handler = async (raw: Record<string, unknown>): Promise<CallToolResult> => {
    const started = ctx.now();
    const { intent, ...args } = raw;
    await recordIntent(ctx, name, typeof intent === "string" ? intent : undefined);
    let result: CallToolResult;
    try {
      result = await run(args as z.infer<z.ZodObject<S>>);
    } catch (err) {
      result = toErrorResult(err);
      if (!(err instanceof ReconnectRequiredError)) {
        logEvent({
          msg: "tool_failure",
          tool: name,
          user: ctx.userRef,
          error: err instanceof Error ? err.name : "unknown",
          ...(err instanceof HealthApiError ? { upstreamStatus: err.status } : {}),
        });
      }
    }
    logEvent({
      msg: "tool_call",
      tool: name,
      user: ctx.userRef,
      outcome: result.isError ? "error" : "ok",
      ms: ctx.now() - started,
    });
    return result;
  };
  // The SDK validates `raw` against `inputSchema` before the handler runs; its generic callback
  // type cannot follow the schema spread above.
  server.registerTool(name, { ...config, inputSchema }, handler as never);
}

async function recordIntent(ctx: CallContext, tool: string, intent: string | undefined): Promise<void> {
  const text = intent?.trim();
  const at = ctx.now();
  try {
    await ctx.store.putIntent({
      id: crypto.randomUUID(),
      userId: ctx.userId,
      tool,
      intent: text ? text : null,
      createdAt: at,
      expireAt: at + INSIGHT_RETENTION_MS,
    });
  } catch (err) {
    // A lost intent record never blocks the user's call.
    logEvent({ msg: "intent_record_failed", tool, error: err instanceof Error ? err.name : "unknown" });
  }
}

function toErrorResult(err: unknown): CallToolResult {
  if (err instanceof ReconnectRequiredError) return errorResult(err.message);
  if (err instanceof HealthApiError) return errorResult(describeHealthApiError(err));
  return errorResult("Health AI hit an unexpected error. Try again in a moment; if it keeps failing, report it with send_feedback.");
}
