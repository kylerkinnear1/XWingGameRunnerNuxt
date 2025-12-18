import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from "postgres";
import * as schema from "./schema.ts";

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    db = drizzle(postgres(connectionString), { schema });
  }
  return db;
}