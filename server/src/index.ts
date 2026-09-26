import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { cloudKmsWrapper, EnvelopeSealer } from "./crypto/kms.js";
import { AesGcmSealer, type Sealer } from "./crypto/sealer.js";
import { HttpGoogleOAuth } from "./google/oauth.js";
import { GOOGLE_CALLBACK_PATH } from "./auth/routes.js";
import { logEvent } from "./log.js";
import { FirestoreStore } from "./store/firestore.js";
import { MemoryStore } from "./store/memory.js";
import type { Store } from "./store/types.js";

const config = loadConfig();

function makeStore(): Store {
  if (config.store.kind === "firestore") {
    return FirestoreStore.create(config.store.databaseId ? { databaseId: config.store.databaseId } : {});
  }
  // Local development only: records vanish on restart. The allow list comes from ALLOW_LIST.
  const store = new MemoryStore();
  for (const email of config.store.allowList) store.allow(email, email === config.store.ownerEmail);
  return store;
}

const sealer: Sealer = config.sealer.kind === "kms"
  ? new EnvelopeSealer(cloudKmsWrapper(config.sealer.keyName))
  : new AesGcmSealer(config.sealer.key);

const { app } = createApp({
  ...config,
  store: makeStore(),
  sealer,
  google: new HttpGoogleOAuth(
    config.googleClientId,
    config.googleClientSecret,
    new URL(GOOGLE_CALLBACK_PATH, config.publicUrl).href,
  ),
});

const server = app.listen(config.port, () => {
  logEvent({ msg: "listening", port: config.port, store: config.store.kind, sealer: config.sealer.kind });
});

// Cloud Run sends SIGTERM before stopping an instance.
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
