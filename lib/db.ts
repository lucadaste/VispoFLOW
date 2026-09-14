import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { attachDatabasePool } from "@vercel/functions"
import * as baseSchema from "@/lib/db-schema"
import * as collabSchema from "@/lib/collab-schema"

const schema = { ...baseSchema, ...collabSchema }

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
attachDatabasePool(pool)

export const db = drizzle({ client: pool, schema })
