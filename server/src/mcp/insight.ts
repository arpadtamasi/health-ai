import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FEEDBACK_KINDS, FEEDBACK_SOURCES } from "../store/types.js";
import { INSIGHT_RETENTION_MS } from "./retention.js";
import { addTool, errorResult, jsonResult, textResult, type CallContext } from "./tool.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const SEND_FEEDBACK_DESCRIPTION =
  "Send feedback about Health AI to its owner. Use it when the user asks you to pass something on (source \"user\"), " +
  "and on your own, without asking the user first (source \"agent\"), whenever using Health AI took more calls than " +
  "the task needed (kind \"too_many_calls\", listing the tools you had to combine), a result was confusing, " +
  "or a capability was missing.";

/** IF-01m3ec2hvdh0e2j8fs6n0xrgst (send_feedback tool) · BR-01m3ecxdq6nqjjejph3j93jws4 (Agents are asked to report friction). */
export function registerSendFeedback(server: McpServer, ctx: CallContext): void {
  addTool(server, ctx, "send_feedback", {
    title: "Send feedback",
    description: SEND_FEEDBACK_DESCRIPTION,
    inputSchema: {
      message: z.string().describe("The feedback itself, in a few sentences."),
      source: z.enum(FEEDBACK_SOURCES).describe("\"user\" when the user asked you to send it, \"agent\" when you send it on your own."),
      kind: z.enum(FEEDBACK_KINDS).describe("What kind of feedback this is."),
      tools: z.array(z.string()).optional().describe("The Health AI tools the feedback concerns, e.g. the calls you had to combine."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async ({ message, source, kind, tools }) => {
    const text = message.trim();
    if (!text) return errorResult("A feedback message is required. Nothing was stored.");
    const at = ctx.now();
    await ctx.store.putFeedback({
      id: crypto.randomUUID(),
      userId: ctx.userId,
      source,
      kind,
      tools: tools ?? [],
      message: text,
      createdAt: at,
      expireAt: at + INSIGHT_RETENTION_MS,
    });
    return textResult("Thanks, the feedback was received and passed on to the owner of Health AI.");
  });
}

const isoDate = (what: string) => z.string().optional().describe(`${what} as an ISO 8601 date or date-time.`);

/**
 * IF-01m3ec2j6wkazgfenh95w6mn4b (list_feedback and usage_summary tools). Registered for the owner only,
 * so testers neither list nor call them; the handlers check again. These are the one exception to
 * BR-01m3eb1btydhctabx4d1c6zyat (Per-user data isolation): they read every user's feedback and intent
 * records, identified by pseudonym, and nothing else of theirs.
 */
export function registerOwnerTools(server: McpServer, ctx: CallContext): void {
  if (!ctx.isOwner) return;
  const ownerOnly = "Only the owner of Health AI can use this tool.";

  addTool(server, ctx, "list_feedback", {
    title: "List feedback",
    description: "Owner only. Lists feedback from all users and their agents, newest first, with source, kind, related tools and time.",
    inputSchema: {
      from: isoDate("Start of the period (default: 30 days ago)"),
      to: isoDate("End of the period (default: now)"),
      limit: z.number().int().min(1).max(200).optional().describe("How many entries to return (default 50)."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ from, to, limit }) => {
    if (!ctx.isOwner) return errorResult(ownerOnly);
    const range = parseRange(from, to, 30, ctx.now());
    if ("error" in range) return errorResult(range.error);
    const items = await ctx.store.listFeedback(range, limit ?? 50);
    return jsonResult({
      from: new Date(range.from).toISOString(),
      to: new Date(range.to).toISOString(),
      feedback: items.map((f) => ({
        at: new Date(f.createdAt).toISOString(),
        user: userRefOf(ctx, f.userId),
        source: f.source,
        kind: f.kind,
        tools: f.tools,
        message: f.message,
      })),
    });
  });

  addTool(server, ctx, "usage_summary", {
    title: "Usage summary",
    description: "Owner only. Call counts per tool and the recorded intents of all users for a period (default: the last 7 days).",
    inputSchema: {
      from: isoDate("Start of the period (default: 7 days ago)"),
      to: isoDate("End of the period (default: now)"),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ from, to }) => {
    if (!ctx.isOwner) return errorResult(ownerOnly);
    const range = parseRange(from, to, 7, ctx.now());
    if ("error" in range) return errorResult(range.error);
    const intents = await ctx.store.listIntents(range);
    const calls: Record<string, number> = {};
    for (const i of intents) calls[i.tool] = (calls[i.tool] ?? 0) + 1;
    return jsonResult({
      from: new Date(range.from).toISOString(),
      to: new Date(range.to).toISOString(),
      totalCalls: intents.length,
      callsPerTool: calls,
      callsWithoutIntent: intents.filter((i) => i.intent === null).length,
      intents: intents.map((i) => ({
        at: new Date(i.createdAt).toISOString(),
        user: userRefOf(ctx, i.userId),
        tool: i.tool,
        intent: i.intent ?? "(intent missing)",
      })),
    });
  });
}

function userRefOf(ctx: CallContext, userId: string): string {
  return userId === ctx.userId ? "you" : ctx.pseudonymOf(userId);
}

function parseRange(from: string | undefined, to: string | undefined, defaultDays: number, now: number) {
  // The default end includes records written this very millisecond.
  const end = to === undefined ? now + 1 : Date.parse(to);
  if (Number.isNaN(end)) return { error: "Invalid argument `to`: use an ISO 8601 date or date-time." };
  const start = from === undefined ? end - defaultDays * DAY_MS : Date.parse(from);
  if (Number.isNaN(start)) return { error: "Invalid argument `from`: use an ISO 8601 date or date-time." };
  if (start >= end) return { error: "Invalid argument `from`: it must be earlier than `to`." };
  return { from: start, to: end };
}
