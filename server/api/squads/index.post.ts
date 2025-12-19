import { db } from "../../db/db";
import { squads } from "../../db/schema";
import { SquadUpdateDto, SquadUpdateResponseDto } from "#shared/squad-dto";
import { auth } from "../../auth";

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
  
    const body = await readBody<SquadUpdateDto>(event);
    
    if (!body.faction) {
      throw createError({
        statusCode: 400,
        message: "Name and faction are required"
      });
    }
    
    const now = new Date();
    const [newSquad] = await db
      .insert(squads)
      .values({
        userId: session.user.id,
        name: body.name,
        faction: body.faction,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    return {
      id: newSquad.id,
      updatedAt: newSquad.updatedAt,
      createdAt: newSquad.createdAt
    };
  });