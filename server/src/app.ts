import { createServer, type Server } from "node:http";

// The HTTP entry point. MCP, OAuth and tool routes are added by later tasks;
// for now it only answers the Cloud Run health check.
export function createApp(): Server {
  return createServer((req, res) => {
    if (req.method === "GET" && req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}
