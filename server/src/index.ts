import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { AesGcmSealer } from "./crypto/sealer.js";
import { HttpGoogleOAuth } from "./google/oauth.js";
import { GOOGLE_CALLBACK_PATH } from "./auth/routes.js";
import { logEvent } from "./log.js";
import { MemoryStore } from "./store/memory.js";

const config = loadConfig();
// The Firestore store and the Cloud KMS sealer replace these in task 2.2.
const store = new MemoryStore();
const ownerEmail = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
for (const email of (process.env.ALLOW_LIST ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)) {
  store.allow(email, email === ownerEmail);
}

const { app } = createApp({
  ...config,
  store,
  sealer: new AesGcmSealer(config.sealerKey),
  google: new HttpGoogleOAuth(
    config.googleClientId,
    config.googleClientSecret,
    new URL(GOOGLE_CALLBACK_PATH, config.publicUrl).href,
  ),
});

const server = app.listen(config.port, () => {
  logEvent({ msg: "listening", port: config.port });
});

// Cloud Run sends SIGTERM before stopping an instance.
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
