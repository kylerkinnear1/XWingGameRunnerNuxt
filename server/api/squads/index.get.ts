import { db } from "../../db/db";
import { squads, squadShips, shipUpgrades } from "../../db/schema";
import {
  SquadReadResponseDto,
  SquadReadDto,
  ShipDto,
} from "#shared/squad-dto";
import { auth } from "../../auth";
import { eq, desc } from "drizzle-orm";
import { Faction } from "#shared/enums";

export default defineEventHandler<Promise<SquadReadResponseDto>>(
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

    const results = await db
      .select({
        squad: squads,
        ship: squadShips,
        upgrade: shipUpgrades,
      })
      .from(squads)
      .leftJoin(squadShips, eq(squads.id, squadShips.squadId))
      .leftJoin(shipUpgrades, eq(squadShips.id, shipUpgrades.shipId))
      .where(eq(squads.userId, session.user.id))
      .orderBy(desc(squads.updatedAt), shipUpgrades.sortOrder);

    const squadsWithShips = Object.values(
      Object.groupBy(
        results.filter((r) => r.squad),
        (r) => r.squad!.id
      )
    )
      .filter(
        (squadGroup): squadGroup is NonNullable<typeof squadGroup> =>
          squadGroup !== undefined && squadGroup.length > 0
      )
      .map((squadGroup) => {
        const first = squadGroup[0];
        return {
          id: first.squad!.id,
          userId: first.squad!.userId,
          name: first.squad!.name,
          faction: first.squad!.faction as Faction,
          createdAt: first.squad!.createdAt,
          updatedAt: first.squad!.updatedAt,

          ships: Object.values(
            Object.groupBy(
              squadGroup.filter((r) => r.ship),
              (r) => r.ship!.id
            )
          )
            .filter(
              (shipGroup): shipGroup is NonNullable<typeof shipGroup> =>
                shipGroup !== undefined && shipGroup.length > 0
            )
            .map((shipGroup) => {
              const firstShip = shipGroup[0];
              return {
                id: firstShip.ship!.id,
                pilotId: firstShip.ship!.pilotId || "",
                upgradeIds: shipGroup
                  .filter((r) => r.upgrade)
                  .map((r) => r.upgrade!.upgradeId),
              };
            }),
        };
      });

    return { squads: squadsWithShips };
  }
);
