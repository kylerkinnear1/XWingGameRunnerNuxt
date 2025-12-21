import { db } from "../../db/db";
import { games, gameSteps } from "../../db/schema";
import type { GameStateDto, GameStepDto } from "#shared/game-state-dto";
import { auth } from "../../auth";
import { eq, asc } from "drizzle-orm";

export default defineEventHandler<Promise<GameStateDto>>(async (event) => {
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

  if (!gameId) {
    throw createError({
      statusCode: 400,
      message: "Game ID is required",
    });
  }

  // Fetch game with steps in a single query
  const results = await db
    .select({
      game: games,
      step: gameSteps,
    })
    .from(games)
    .leftJoin(gameSteps, eq(games.id, gameSteps.gameId))
    .where(eq(games.id, gameId))
    .orderBy(asc(gameSteps.createdAt));

  if (!results.length || !results[0].game) {
    throw createError({
      statusCode: 404,
      message: "Game not found",
    });
  }

  const game = results[0].game;
  const steps = results
    .filter((r) => r.step !== null)
    .map((r) => r.step!.step as GameStepDto);

  return {
    id: game.id,
    player1Id: game.player1Id,
    player2Id: game.player2Id,
    player1SquadId: game.player1SquadId,
    player2SquadId: game.player2SquadId,
    steps,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
});
