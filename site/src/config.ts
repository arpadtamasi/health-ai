// Build-time settings, from the same variables scripts/deploy.sh gives the Cloud Run service.
// PUBLIC_URL defaults to the local server. GOOGLE_HEALTH_WRITE_SCOPES unset (local preview) shows
// the meal example; set but empty (a read-only deploy) hides it, as the server's write tools are off.
const writeScopes = process.env.GOOGLE_HEALTH_WRITE_SCOPES;

export const publicUrl = new URL(process.env.PUBLIC_URL ?? "http://localhost:8080");
export const mcpUrl = new URL("/mcp", publicUrl).href;
export const writeAvailable = writeScopes === undefined || writeScopes.trim() !== "";
