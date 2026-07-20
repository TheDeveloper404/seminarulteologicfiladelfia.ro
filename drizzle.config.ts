import { defineConfig } from "drizzle-kit";

// `generate` nu se conectează efectiv la DB, doar citește schema — placeholder-ul
// e suficient local. Pentru `migrate`/`introspect` e nevoie de DATABASE_URL real.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
