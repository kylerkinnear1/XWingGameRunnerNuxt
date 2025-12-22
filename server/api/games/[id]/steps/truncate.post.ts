import { db } from "../../../../db/db";
import { games, gameSteps } from "../../../../db/schema";
import { auth } from "../../../../auth";
import { eq, and, inArray } from "drizzle-orm";

export default defineEventHandler<Promise<{ success: boolean }>>(
  async (event) => {
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const gameId = getRouterParam(event, "id");
    const body = await readBody<{ afterIndex: number }>(event);

    if (!gameId) {
      throw createError({
        statusCode: 400,
        message: "Game ID is required",
      });
    }

    if (body.afterIndex === undefined || body.afterIndex < 0) {
      throw createError({
        statusCode: 400,
        message: "afterIndex is required and must be >= 0",
      });
    }

    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!game) {
      throw createError({
        statusCode: 404,
        message: "Game not found",
      });
    }

    const allSteps = await db
      .select()
      .from(gameSteps)
      .where(eq(gameSteps.gameId, gameId))
      .orderBy(gameSteps.createdAt);

    if (body.afterIndex >= allSteps.length) {
      return { success: true };
    }

    const stepsToDelete = allSteps.slice(body.afterIndex + 1);
    const stepIdsToDelete = stepsToDelete.map((s) => s.id);

    if (stepIdsToDelete.length > 0) {
      await db
        .delete(gameSteps)
        .where(
          and(eq(gameSteps.gameId, gameId), inArray(gameSteps.id, stepIdsToDelete))
        );
    }

    return { success: true };
  }
);

