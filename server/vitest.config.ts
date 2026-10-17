import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // supertest lets the OS pick a port on the wildcard address, and on macOS that port can already be taken by another
    // process's 127.0.0.1 listener (a browser's remote-debugging port, a dev server): the request then reaches that process
    // and fails in unrelated ways (404, "Invalid URL", "WebSockets request was expected"). A second try picks another port.
    retry: 2,
  },
});
