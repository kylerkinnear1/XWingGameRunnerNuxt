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
  return shipType.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
}

// Ship type aliases - maps alternative names to canonical ship types
const SHIP_TYPE_ALIASES: Record<string, string> = {
  "vcx100": "ghost",
  "vcx-100": "ghost",
  "ghost": "ghost",
};

export function parseCards(jsonText: string): CardsDto {
  const raw = JSON.parse(jsonText) as RawCardsJson;

  const shipManeuversMap = new Map<string, Maneuver[]>();
  for (const ship of raw.ships) {
    const normalizedKey = normalizeShipType(ship.shipType);
    shipManeuversMap.set(normalizedKey, ship.maneuvers);
  }

  const pilots: PilotDto[] = raw.pilots.map((pilot) => {
    // Use shipType if available, otherwise fall back to shipKey
    const rawShipType = pilot.shipType?.trim() || pilot.shipKey;
    const normalizedShipType = normalizeShipType(rawShipType);
    
    // Check for aliases first
    const aliasedKey = SHIP_TYPE_ALIASES[normalizedShipType] || normalizedShipType;
    
    console.log(`[parseCards] Pilot: ${pilot.pilotName || pilot.id}, rawShipType: "${rawShipType}", normalized: "${normalizedShipType}", aliased: "${aliasedKey}"`);
    
    let maneuvers: Maneuver[] = [];
    let matchedShipType: string | null = null;
    
    // Try direct match with alias
    if (shipManeuversMap.has(aliasedKey)) {
      maneuvers = shipManeuversMap.get(aliasedKey)!;
      matchedShipType = aliasedKey;
      console.log(`[parseCards] Found maneuvers via alias match: "${aliasedKey}" (${maneuvers.length} maneuvers)`);
    } else if (shipManeuversMap.has(normalizedShipType)) {
      maneuvers = shipManeuversMap.get(normalizedShipType)!;
      matchedShipType = normalizedShipType;
      console.log(`[parseCards] Found maneuvers via direct match: "${normalizedShipType}" (${maneuvers.length} maneuvers)`);
    } else {
      // Try prefix matching with alias
      for (const [normalizedShipTypeKey, shipManeuvers] of shipManeuversMap.entries()) {
        if (aliasedKey.startsWith(normalizedShipTypeKey) || normalizedShipTypeKey.startsWith(aliasedKey)) {
          maneuvers = shipManeuvers;
          matchedShipType = normalizedShipTypeKey;
          console.log(`[parseCards] Found maneuvers via prefix match (alias): "${aliasedKey}" -> "${normalizedShipTypeKey}" (${maneuvers.length} maneuvers)`);
          break;
        }
      }
      // Fallback to original prefix matching
      if (maneuvers.length === 0) {
        for (const [normalizedShipTypeKey, shipManeuvers] of shipManeuversMap.entries()) {
          if (normalizedShipType.startsWith(normalizedShipTypeKey) || normalizedShipTypeKey.startsWith(normalizedShipType)) {
            maneuvers = shipManeuvers;
            matchedShipType = normalizedShipTypeKey;
            console.log(`[parseCards] Found maneuvers via prefix match: "${normalizedShipType}" -> "${normalizedShipTypeKey}" (${maneuvers.length} maneuvers)`);
            break;
          }
        }
      }
    }
    
    if (maneuvers.length === 0 && pilot.maneuvers) {
      maneuvers = pilot.maneuvers;
      console.log(`[parseCards] Using pilot's own maneuvers (${maneuvers.length} maneuvers)`);
    }
    
    if (maneuvers.length === 0) {
      console.warn(`[parseCards] No maneuvers found for pilot: ${pilot.pilotName || pilot.id}, shipType: "${rawShipType}"`);
    }

    // Determine final shipType - use matched ship type if found, otherwise use original
    let finalShipType = rawShipType;
    if (matchedShipType) {
      // Find the original ship type from the ships array that matches
      const matchingShip = raw.ships.find((ship) => 
        normalizeShipType(ship.shipType) === matchedShipType
      );
      if (matchingShip) {
        finalShipType = matchingShip.shipType;
        console.log(`[parseCards] Resolved shipType: "${rawShipType}" -> "${finalShipType}"`);
      }
    }

    return {
      ...pilot,
      shipType: finalShipType,
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
