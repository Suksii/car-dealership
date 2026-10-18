import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Jedinični testovi za čiste module (utils, validacija, helperi). Bez jsdom, bez komponenti.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
