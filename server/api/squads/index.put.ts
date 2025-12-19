// server/api/squads/[id].put.ts
import { db } from "../../db/db";
import { squads } from "../../db/schema";
import { SquadUpdateDto, SquadUpdateResponseDto } from "#shared/squad-dto";
import { auth } from "../../auth";
import { eq, and } from "drizzle-orm";

export default defineEventHandler<Promise<SquadUpdateResponseDto>>(async (event) => {
  const session = await auth.api.getSession({ 
    headers: event.headers 
  });
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }

  const squadId = getRouterParam(event, 'id');
  const body = await readBody<SquadUpdateDto>(event);
  
  if (!body.faction) {
    throw createError({
      statusCode: 400,
      message: "Name and faction are required"
    });
  }
  
  const now = new Date();
  const [updatedSquad] = await db
    .update(squads)
    .set({
      name: body.name ?? "",
      faction: body.faction,
      updatedAt: now
    })
    .where(and(
      eq(squads.id, squadId!),
      eq(squads.userId, session.user.id) // Ensure user owns this squad
    ))
    .returning();
  
  if (!updatedSquad) {
    throw createError({
      statusCode: 404,
      message: "Squad not found"
    });
  }
  
  return {
    id: updatedSquad.id,
    updatedAt: updatedSquad.updatedAt,
    createdAt: updatedSquad.createdAt
  };
});