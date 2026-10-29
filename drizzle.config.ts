import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local", quiet: true })

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error("DATABASE_URL_UNPOOLED is not set in .env.local")
}

// The NestJS API owns the schema and its migrations. This app only introspects
// it with `npm run db:pull`; never run `drizzle-kit generate/migrate/push` here.
export default defineConfig({
  out: "./lib/db/generated",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
  schemaFilter: ["public"],
  introspect: {
    casing: "camel",
  },
})
