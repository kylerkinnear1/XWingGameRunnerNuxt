import { db } from "../../db/db";
import { squads } from "../../db/schema";
import { SquadReadResponseDto } from "#shared/squad-dto";
import { auth } from "../../auth";
import { eq } from "drizzle-orm";

export default defineEventHandler<Promise<SquadReadResponseDto>>(async (event) => {
  const session = await auth.api.getSession({ 
    headers: event.headers 
  });
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }

  const userSquads = await db
    .select()
    .from(squads)
    .where(eq(squads.userId, session.user.id));
  
  return { squads: userSquads };
});