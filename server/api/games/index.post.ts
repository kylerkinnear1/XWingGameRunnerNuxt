import { db } from "../../db/db";
import { games } from "../../db/schema";
import { auth } from "../../auth";

interface CreateGameDto {
  player1SquadId: string;
  player2SquadId: string;
  player2Id?: string; // Optional for now, can default to same user or a placeholder
}

interface CreateGameResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export default defineEventHandler<Promise<CreateGameResponseDto>>(
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

    const body = await readBody<CreateGameDto>(event);

    // Validate required fields
    if (!body.player1SquadId || !body.player2SquadId) {
      throw createError({
        statusCode: 400,
        message: "Both squad IDs are required",
      });
    }

    const now = new Date();

    // For now, use the same user for both players if player2Id not provided
    // This allows solo testing
    const player2Id = body.player2Id || session.user.id;

    const [newGame] = await db
      .insert(games)
      .values({
        player1Id: session.user.id,
        player2Id: player2Id,
        player1SquadId: body.player1SquadId,
        player2SquadId: body.player2SquadId,
        userId: session.user.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return {
      id: newGame.id,
      createdAt: newGame.createdAt,
      updatedAt: newGame.updatedAt,
    };
  }
);
