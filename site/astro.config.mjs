// @ts-check
import { defineConfig } from "astro/config";

// Static build for Firebase Hosting (firebase.json serves site/dist). Hosting answers from these
// files first; every other path is rewritten to the Cloud Run service.
export default defineConfig({
  output: "static",
  build: { format: "file" },
  // The page reuses the sign-in pages' tokens and icons from server/src/auth/pages.ts.
  vite: { server: { fs: { allow: [".."] } } },
});
