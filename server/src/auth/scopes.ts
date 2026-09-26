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

/** Human wording for missing Google permissions; scope URLs mean nothing to users. */
export function describeMissing(c: ScopeConfig, missing: string[]): string[] {
  const out: string[] = [];
  if (missing.some((s) => c.healthReadScopes.includes(s))) out.push("Read your Google Health data (sleep, heart rate, activity)");
  if (missing.some((s) => c.healthWriteScopes.includes(s))) out.push("Log meals and water in Google Health");
  return out;
}
