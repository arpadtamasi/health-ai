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
  /** 32-byte key for the local sealer; replaced by Cloud KMS in production. */
  sealerKey: Buffer;
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
  const sealerKey = Buffer.from(required(env, "SEALER_KEY"), "base64");
  if (sealerKey.length !== 32) throw new Error("SEALER_KEY must be 32 bytes, base64-encoded");
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
    sealerKey,
  };
}
