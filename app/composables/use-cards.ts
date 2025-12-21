import { parseCards } from "#shared/cards.parser";
import type { CardsDto, PilotDto } from "#shared/cards";
import type { Faction } from "#shared/enums";

export const useCards = () => {
  const cards = useState<CardsDto | null>("cards", () => null);
  const loading = useState<boolean>("cardsLoading", () => false);
  const error = useState<Error | null>("cardsError", () => null);

  const loadCards = async () => {
    if (cards.value) return; // Already loaded
    if (!process.client) return; // Only load on client side

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch("/cards.json");
      const text = await response.text();
      cards.value = parseCards(text);
    } catch (e) {
      error.value = e as Error;
      console.error("Failed to load cards:", e);
    } finally {
      loading.value = false;
    }
  };

  // Auto-load cards when composable is first used (client-side only)
  if (process.client && !cards.value && !loading.value && !error.value) {
    loadCards();
  }

  const getPilotsForFaction = (faction: Faction): PilotDto[] => {
    if (!cards.value) return [];

    const factionKey = faction.toLowerCase();
    return cards.value.pilots.filter((p) => p.factionKey === factionKey);
  };

  const groupPilotsByShip = (pilots: PilotDto[]) => {
    const grouped = new Map<string, PilotDto[]>();

    for (const pilot of pilots) {
      const shipKey = pilot.id;
      if (!grouped.has(shipKey)) {
        grouped.set(shipKey, []);
      }
      grouped.get(shipKey)!.push(pilot);
    }

    // Sort pilots within each ship by skill (descending)
    for (const [, shipPilots] of grouped) {
      shipPilots.sort((a, b) => b.pilotSkill - a.pilotSkill);
    }

    return grouped;
  };

  return {
    cards: readonly(cards),
    loading: readonly(loading),
    error: readonly(error),
    loadCards,
    getPilotsForFaction,
    groupPilotsByShip,
  };
};
