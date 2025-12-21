import { db } from "../../../db/db";
import { games, gameSteps } from "../../../db/schema";
import type { GameStepDto } from "#shared/game-state-dto";
import { auth } from "../../../auth";
import { eq } from "drizzle-orm";

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
    const body = await readBody<GameStepDto>(event);

    if (!gameId) {
      throw createError({
        statusCode: 400,
        message: "Game ID is required",
      });
    }

    // Verify game exists
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

    const now = new Date();

    await db.insert(gameSteps).values({
      gameId,
      type: body.type,
      step: body,
      createdAt: now,
    });

    return { success: true };
  }
);
