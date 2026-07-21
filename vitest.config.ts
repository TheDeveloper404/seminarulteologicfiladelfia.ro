import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Modulele testate importă (fără să folosească direct) @/db, care validează DATABASE_URL
    // la încărcare — o valoare falsă e suficientă, nu se deschide conexiune reală în teste.
    env: { DATABASE_URL: "postgres://test:test@localhost:5432/test" },
  },
});
