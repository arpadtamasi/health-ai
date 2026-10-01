import Anthropic from "@anthropic-ai/sdk";
import type { ImageInput, Usage } from "./types.js";

export interface ToolSpec {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ModelRequest {
  model: string;
  system: string;
  text: string;
  images?: ImageInput[];
  tool: ToolSpec;
  maxTokens: number;
}

export interface ModelResponse {
  toolInput: unknown;
  usage: Usage;
}

/** A single forced tool call: structured answers for a one-shot task (what to eat from a photo). */
export interface ToolCaller {
  callTool(req: ModelRequest): Promise<ModelResponse>;
}

/** One block of a conversation turn, in the shape the agent loop needs. */
export type Block =
  | { type: "text"; text: string }
  | { type: "image"; image: ImageInput }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; toolUseId: string; content: string };

export interface Turn { role: "user" | "assistant"; content: Block[] }

export interface ConverseRequest {
  model: string;
  system: string;
  turns: Turn[];
  tools: ToolSpec[];
  maxTokens: number;
}

export interface ConverseResponse {
  content: Block[];
  stopReason: "end_turn" | "tool_use" | "max_tokens" | "other";
  usage: Usage;
}

export interface ModelClient {
  /** One model turn with several tools available and free text allowed. */
  converse(req: ConverseRequest): Promise<ConverseResponse>;
}

/** What the app needs from the model provider: one-shot structured calls and the multi-turn agent. */
export type AiModel = ModelClient & ToolCaller;

export class AnthropicModelClient implements ModelClient, ToolCaller {
  private readonly client: Anthropic;

  constructor(apiKey: string, workspaceId?: string) {
    this.client = new Anthropic({ apiKey, ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {}) });
  }

  async callTool(req: ModelRequest): Promise<ModelResponse> {
    const content: Anthropic.Messages.ContentBlockParam[] = [
      ...(req.images ?? []).map((i): Anthropic.Messages.ContentBlockParam => ({
        type: "image",
        source: { type: "base64", media_type: i.mediaType, data: i.dataBase64 },
      })),
      { type: "text", text: req.text },
    ];
    const res = await this.client.messages.create({
      model: req.model,
      max_tokens: req.maxTokens,
      system: req.system,
      tools: [{ name: req.tool.name, description: req.tool.description, input_schema: req.tool.inputSchema as Anthropic.Messages.Tool.InputSchema }],
      tool_choice: { type: "tool", name: req.tool.name },
      messages: [{ role: "user", content }],
    });
    const block = res.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") throw new Error("The model did not return the requested tool call.");
    return { toolInput: block.input, usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens } };
  }

  async converse(req: ConverseRequest): Promise<ConverseResponse> {
    const toParam = (b: Block): Anthropic.Messages.ContentBlockParam => {
      switch (b.type) {
        case "text": return { type: "text", text: b.text };
        case "image": return { type: "image", source: { type: "base64", media_type: b.image.mediaType, data: b.image.dataBase64 } };
        case "tool_use": return { type: "tool_use", id: b.id, name: b.name, input: b.input };
        case "tool_result": return { type: "tool_result", tool_use_id: b.toolUseId, content: b.content };
      }
    };
    const res = await this.client.messages.create({
      model: req.model,
      max_tokens: req.maxTokens,
      system: req.system,
      tools: req.tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.inputSchema as Anthropic.Messages.Tool.InputSchema })),
      messages: req.turns.map((t) => ({ role: t.role, content: t.content.map(toParam) })),
    });
    const content: Block[] = [];
    for (const b of res.content) {
      if (b.type === "text") content.push({ type: "text", text: b.text });
      else if (b.type === "tool_use") content.push({ type: "tool_use", id: b.id, name: b.name, input: b.input });
    }
    const stopReason = res.stop_reason === "end_turn" || res.stop_reason === "tool_use" || res.stop_reason === "max_tokens" ? res.stop_reason : "other";
    return { content, stopReason, usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens } };
  }
}
