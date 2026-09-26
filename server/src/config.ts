export interface Config {
  port: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const raw = env.PORT ?? "8080";
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${raw}"`);
  }
  return { port };
}
