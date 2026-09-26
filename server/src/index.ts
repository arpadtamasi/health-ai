import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const { port } = loadConfig();
const server = createApp();

server.listen(port, () => {
  console.log(JSON.stringify({ msg: "listening", port }));
});

// Cloud Run sends SIGTERM before stopping an instance.
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
