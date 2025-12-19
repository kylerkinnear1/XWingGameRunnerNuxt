import { getDb } from "../../db/getDb";
import { squads } from "../../db/schema";
import { IndexDto } from "#shared/indexDto";

export default defineEventHandler<Promise<IndexDto>>(async (event) => {
  const db = getDb();
  const allSquads = await db.select().from(squads);
  return { squads: allSquads };
});