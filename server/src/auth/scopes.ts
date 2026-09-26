/** The MCP scopes this server issues, derived from what the user granted Google. */
export const MCP_SCOPES = { read: "health.read", write: "health.write" } as const;

interface ScopeConfig {
  healthReadScopes: string[];
  healthWriteScopes: string[];
}

export const googleScopes = (c: ScopeConfig): string[] => ["openid", "email", ...c.healthReadScopes, ...c.healthWriteScopes];

export interface ScopeCheck {
  missingRead: string[];
  mcpScopes: string[];
}

/** BR-01m3eb1dz1bqrx534g1g403fqw: read scopes are required; write scopes are optional. */
export function checkGrantedScopes(c: ScopeConfig, granted: string[]): ScopeCheck {
  const has = new Set(granted);
  const missingRead = c.healthReadScopes.filter((s) => !has.has(s));
  const writeOk = c.healthWriteScopes.length > 0 && c.healthWriteScopes.every((s) => has.has(s));
  const mcpScopes = missingRead.length === 0 ? [MCP_SCOPES.read, ...(writeOk ? [MCP_SCOPES.write] : [])] : [];
  return { missingRead, mcpScopes };
}
