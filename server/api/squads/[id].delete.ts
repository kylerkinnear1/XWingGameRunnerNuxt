// server/api/squads/[id].delete.ts
import { db } from "../../db/db";
import { squads } from "../../db/schema";
import { auth } from "../../auth";
import { eq, and } from "drizzle-orm";

export default defineEventHandler<Promise<void>>(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const squadId = getRouterParam(event, "id");

  if (!squadId) {
    throw createError({
      statusCode: 400,
      message: "Squad ID is required",
    });
  }

  // Delete the squad - cascade will handle ships and upgrades
  const result = await db
    .delete(squads)
    .where(and(eq(squads.id, squadId), eq(squads.userId, session.user.id)))
    .returning();

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      message: "Squad not found or you don't have permission to delete it",
    });
  }

  return;
});
