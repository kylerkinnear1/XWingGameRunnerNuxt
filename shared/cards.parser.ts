import type { CardsDto, PilotDto } from "./cards";
import type { Maneuver } from "./enums";

interface RawCardsJson {
  ships: Array<{
    shipType: string;
    maneuvers: Maneuver[];
  }>;
  pilots: Array<PilotDto & { shipKey: string; maneuvers: Maneuver[] | null }>;
  upgrades: CardsDto["upgrades"];
  damageCards: CardsDto["damageCards"];
  damageDeck: CardsDto["damageDeck"];
}

function normalizeShipType(shipType: string): string {
  return shipType.toLowerCase().replace(/\s+/g, "");
}

export function parseCards(jsonText: string): CardsDto {
  const raw = JSON.parse(jsonText) as RawCardsJson;

  const shipManeuversMap = new Map<string, Maneuver[]>();
  for (const ship of raw.ships) {
    const normalizedKey = normalizeShipType(ship.shipType);
    shipManeuversMap.set(normalizedKey, ship.maneuvers);
  }

  const pilots: PilotDto[] = raw.pilots.map((pilot) => {
    const normalizedShipKey = normalizeShipType(pilot.shipKey);
    
    let maneuvers: Maneuver[] = [];
    if (shipManeuversMap.has(normalizedShipKey)) {
      maneuvers = shipManeuversMap.get(normalizedShipKey)!;
    } else {
      for (const [normalizedShipType, shipManeuvers] of shipManeuversMap.entries()) {
        if (normalizedShipKey.startsWith(normalizedShipType)) {
          maneuvers = shipManeuvers;
          break;
        }
      }
    }
    
    if (maneuvers.length === 0 && pilot.maneuvers) {
      maneuvers = pilot.maneuvers;
    }

    return {
      ...pilot,
      maneuvers,
    };
  });

  return {
    ships: raw.ships,
    pilots,
    upgrades: raw.upgrades,
    damageCards: raw.damageCards,
    damageDeck: raw.damageDeck,
  };
}
