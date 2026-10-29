import { attachDatabasePool } from "@vercel/functions"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as relations from "./generated/relations"
import * as schema from "./generated/schema"

// Read-only: the NestJS API owns the schema and all writes.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Lets Vercel Fluid compute close idle connections before the function suspends.
attachDatabasePool(pool)

export const db = drizzle({ client: pool, schema: { ...schema, ...relations } })
