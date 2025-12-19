import { db } from "../../db/db";
import { squads } from "../../db/schema";
import { IndexDto } from "#shared/indexDto";

export default defineEventHandler<Promise<IndexDto>>(async (event) => {
  const allSquads = await db.select().from(squads);
  return { squads: allSquads };
});