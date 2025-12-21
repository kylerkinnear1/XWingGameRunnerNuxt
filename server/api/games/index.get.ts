import { db } from "../../db/db";
import { games } from "../../db/schema";
import { user } from "../../db/auth-schema";
import { GameSummaryResponseDto } from "#shared/game-dto";
import { auth } from "../../auth";
import { eq, desc } from "drizzle-orm";

export default defineEventHandler<Promise<GameSummaryResponseDto>>(
  async (event) => {
    const query = getQuery(event);
    const email = query.email as string | undefined;

    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const userId = await getQueriedUserId(email, session);

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const results = await db
      .select({
        id: games.id,
        player1Id: games.player1Id,
        player2Id: games.player2Id,
        player1SquadId: games.player1SquadId,
        player2SquadId: games.player2SquadId,
        createdAt: games.createdAt,
        updatedAt: games.updatedAt,
      })
      .from(games)
      .where(eq(games.userId, userId))
      .orderBy(desc(games.updatedAt));

    return { games: results };
  }
);

async function getQueriedUserId(
  email: string | undefined,
  session: {
    session: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      expiresAt: Date;
      token: string;
      ipAddress?: string | null | undefined | undefined;
      userAgent?: string | null | undefined | undefined;
    };
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null | undefined | undefined;
    };
  }
) {
  if (email) {
    const selectedUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!selectedUser.length) {
      throw createError({
        statusCode: 404,
        message: "User not found",
      });
    }

    return selectedUser[0].id;
  }

  return session.user.id;
}
