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

/** The one seam to the model provider: a single forced tool call, so answers are structured and tests can fake it. */
export interface ModelClient {
  callTool(req: ModelRequest): Promise<ModelResponse>;
}

export class AnthropicModelClient implements ModelClient {
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
}
