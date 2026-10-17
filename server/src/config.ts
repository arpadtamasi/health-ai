export interface Config {
  port: number;
  /** Public origin of the service; also the OAuth issuer. */
  publicUrl: URL;
  googleClientId: string;
  googleClientSecret: string;
  /** Google Health scopes every user must grant (read access). */
  healthReadScopes: string[];
  /** Google Health scopes needed only by the write tools. */
  healthWriteScopes: string[];
  /** HMAC key for MCP access tokens and reconnect links. */
  jwtSecret: Uint8Array;
  /** Where records live: Firestore in production, memory only for local development. */
  store: { kind: "firestore"; databaseId?: string } | { kind: "memory"; allowList: string[]; ownerEmail?: string };
  /** How secrets are sealed: Cloud KMS envelope encryption, or a local key with the memory store. */
  sealer: { kind: "kms"; keyName: string } | { kind: "local"; key: Buffer };
}

/** The model behind the app's suggestions. Absent when there is no API key: the app then says suggestions are unavailable. */
export interface AiConfig {
  apiKey: string;
  /** Cheapest model first; set MODEL_WHAT_NOW to move one task to a stronger model. */
  modelName: string;
  /** Tokens (input plus output, from the response's usage) one user may spend per local day. A first guess, to tune by use. */
  dailyTokenLimit: number;
}

export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
export const DEFAULT_DAILY_TOKEN_LIMIT = 150_000;

export function loadAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig | undefined {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return undefined;
  const limit = Number(env.DAILY_TOKEN_LIMIT ?? DEFAULT_DAILY_TOKEN_LIMIT);
  if (!Number.isInteger(limit) || limit <= 0) throw new Error(`DAILY_TOKEN_LIMIT must be a positive integer, got "${env.DAILY_TOKEN_LIMIT}"`);
  return { apiKey, modelName: env.MODEL_WHAT_NOW || DEFAULT_MODEL, dailyTokenLimit: limit };
}

export function loadPort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.PORT ?? "8080";
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${raw}"`);
  }
  return port;
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function scopes(value: string | undefined): string[] {
  return (value ?? "").split(/[\s,]+/).filter(Boolean);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = new TextEncoder().encode(required(env, "JWT_SECRET"));
  if (jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 bytes");
  const healthReadScopes = scopes(env.GOOGLE_HEALTH_READ_SCOPES);
  if (healthReadScopes.length === 0) throw new Error("GOOGLE_HEALTH_READ_SCOPES is required");
  return {
    port: loadPort(env),
    publicUrl: new URL(required(env, "PUBLIC_URL")),
    googleClientId: required(env, "GOOGLE_CLIENT_ID"),
    googleClientSecret: required(env, "GOOGLE_CLIENT_SECRET"),
    healthReadScopes,
    healthWriteScopes: scopes(env.GOOGLE_HEALTH_WRITE_SCOPES),
    jwtSecret,
    ...storeAndSealer(env),
  };
}

function storeAndSealer(env: NodeJS.ProcessEnv): Pick<Config, "store" | "sealer"> {
  const kind = env.STORE ?? "firestore";
  if (kind === "firestore") {
    // Google refresh tokens in Firestore are always sealed with Cloud KMS, never with a local key.
    const keyName = required(env, "KMS_KEY_NAME");
    return {
      store: { kind: "firestore", ...(env.FIRESTORE_DATABASE ? { databaseId: env.FIRESTORE_DATABASE } : {}) },
      sealer: { kind: "kms", keyName },
    };
  }
  if (kind !== "memory") throw new Error(`STORE must be "firestore" or "memory", got "${kind}"`);
  const key = Buffer.from(required(env, "SEALER_KEY"), "base64");
  if (key.length !== 32) throw new Error("SEALER_KEY must be 32 bytes, base64-encoded");
  const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
  return {
    store: {
      kind: "memory",
      allowList: (env.ALLOW_LIST ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
      ...(ownerEmail ? { ownerEmail } : {}),
    },
    sealer: { kind: "local", key },
  };
}
