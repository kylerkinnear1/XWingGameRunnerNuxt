// server/api/squads/[id].put.ts
import { db } from "../../db/db";
import { squads, squadShips, shipUpgrades } from "../../db/schema";
import {
  SquadUpdateDto,
  SquadUpdateResponseDto,
  ShipDto,
} from "#shared/squad-dto";
import { auth } from "../../auth";
import { eq, and, inArray, notInArray } from "drizzle-orm";

export default defineEventHandler<Promise<SquadUpdateResponseDto>>(
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

    const squadId = getRouterParam(event, "id");
    const body = await readBody<SquadUpdateDto>(event);

    if (!body.faction) {
      throw createError({
        statusCode: 400,
        message: "Name and faction are required",
      });
    }

    const result = await db.transaction(async (tx) => {
      const now = new Date();

      const [updatedSquad] = await tx
        .update(squads)
        .set({
          name: body.name ?? "",
          faction: body.faction,
          updatedAt: now,
        })
        .where(and(eq(squads.id, squadId!), eq(squads.userId, session.user.id)))
        .returning();

      if (!updatedSquad) {
        throw createError({
          statusCode: 404,
          message: "Squad not found",
        });
      }

      const existingData = await tx
        .select({
          ship: squadShips,
          upgrade: shipUpgrades,
        })
        .from(squadShips)
        .leftJoin(shipUpgrades, eq(squadShips.id, shipUpgrades.shipId))
        .where(eq(squadShips.squadId, squadId!));

      const existingShips = Array.from(
        new Map(existingData.map((row) => [row.ship.id, row.ship])).values()
      );
      const existingUpgrades = existingData
        .filter((row) => row.upgrade)
        .map((row) => row.upgrade!);

      const existingShipMap = new Map(existingShips.map((s) => [s.id, s]));

      const operations = groupUpdates(
        body,
        existingShipMap,
        existingUpgrades,
        squadId!,
        now
      );

      await updateDatabase(tx, operations, squadId!, now);

      return {
        id: updatedSquad.id,
        updatedAt: updatedSquad.updatedAt,
        createdAt: updatedSquad.createdAt,
      };
    });

    return result;
  }
);

function groupUpdates(
  body: SquadUpdateDto,
  existingShipMap: Map<string, any>,
  existingUpgrades: any[],
  squadId: string,
  now: Date
) {
  const ships = body.ships || [];
  const requestedShipIds = new Set(ships.filter((s) => s.id).map((s) => s.id));
  const shipIdsToDelete: string[] = [];
  const upgradeIdsToDelete: string[] = [];
  const upgradesToInsert: Array<{
    shipId: string;
    upgradeId: string;
    sortOrder: number;
    createdAt: Date;
  }> = [];
  const upgradesToUpdate: Array<{ id: string; sortOrder: number }> = [];
  const newShipsToInsert: Array<{
    squadId: string;
    shipTemplateId: string;
    pilotId: string;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const existingShipIds: string[] = [];

  for (const [shipId, ship] of existingShipMap) {
    if (!requestedShipIds.has(shipId)) {
      shipIdsToDelete.push(ship.id);
    }
  }

  for (const ship of ships) {
    const existingShip = ship.id ? existingShipMap.get(ship.id) : undefined;

    if (existingShip) {
      existingShipIds.push(ship.id);

      const shipExistingUpgrades = existingUpgrades.filter(
        (u) => u.shipId === existingShip.id
      );
      const requestedUpgradeIds = new Set(ship.upgradeIds || []);

      for (const upgrade of shipExistingUpgrades) {
        if (!requestedUpgradeIds.has(upgrade.upgradeId)) {
          upgradeIdsToDelete.push(upgrade.id);
        }
      }

      if (ship.upgradeIds) {
        for (let i = 0; i < ship.upgradeIds.length; i++) {
          const upgradeId = ship.upgradeIds[i];
          const existingUpgrade = shipExistingUpgrades.find(
            (u) => u.upgradeId === upgradeId
          );

          if (existingUpgrade) {
            if (existingUpgrade.sortOrder !== i) {
              upgradesToUpdate.push({ id: existingUpgrade.id, sortOrder: i });
            }
          } else {
            upgradesToInsert.push({
              shipId: existingShip.id,
              upgradeId,
              sortOrder: i,
              createdAt: now,
            });
          }
        }
      }
    } else {
      newShipsToInsert.push({
        squadId,
        shipTemplateId: ship.pilotId,
        pilotId: ship.pilotId,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return {
    shipIdsToDelete,
    upgradeIdsToDelete,
    upgradesToInsert,
    upgradesToUpdate,
    newShipsToInsert,
    existingShipIds,
  };
}

async function updateDatabase(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  operations: ReturnType<typeof groupUpdates>,
  squadId: string,
  now: Date
) {
  const {
    shipIdsToDelete,
    upgradeIdsToDelete,
    upgradesToInsert,
    upgradesToUpdate,
    newShipsToInsert,
    existingShipIds,
  } = operations;

  if (shipIdsToDelete.length > 0) {
    await tx.delete(squadShips).where(inArray(squadShips.id, shipIdsToDelete));
  }

  if (upgradeIdsToDelete.length > 0) {
    await tx
      .delete(shipUpgrades)
      .where(inArray(shipUpgrades.id, upgradeIdsToDelete));
  }

  if (newShipsToInsert.length > 0) {
    await tx.insert(squadShips).values(newShipsToInsert);
  }

  if (existingShipIds.length > 0) {
    await tx
      .update(squadShips)
      .set({ updatedAt: now })
      .where(
        and(
          eq(squadShips.squadId, squadId),
          inArray(squadShips.id, existingShipIds)
        )
      );
  }

  if (upgradesToInsert.length > 0) {
    await tx.insert(shipUpgrades).values(upgradesToInsert);
  }

  for (const upgrade of upgradesToUpdate) {
    await tx
      .update(shipUpgrades)
      .set({ sortOrder: upgrade.sortOrder })
      .where(eq(shipUpgrades.id, upgrade.id));
  }
}
