import type { SquadReadDto, ShipDto } from "#shared/squad-dto";

export const useSquadPoints = () => {
  const { cards } = useCards();

  /**
   * Calculate total points for a squad, including Vaksai cost reduction
   */
  function calculateSquadPoints(
    ships: ShipDto[] | readonly ShipDto[],
    pointLimit?: number
  ): { total: number; isOverLimit: boolean } {
    if (!cards.value) {
      return { total: 0, isOverLimit: false };
    }

    let total = 0;

    ships.forEach((ship) => {
      const card = cards.value!.pilots.find((p) => p.id === ship.pilotId);
      if (card) {
        total += card.points;

        // Check if this ship has Vaksai (reduces upgrade costs by 1)
        const hasVaksai = ship.upgradeIds?.some((upgradeId) => {
          const upgrade = cards.value!.upgrades.find((u) => u.id === upgradeId);
          return upgrade?.name === "Vaksai";
        }) || false;

        // Add upgrade points (only count upgrades that exist in the database)
        ship.upgradeIds?.forEach((upgradeId) => {
          const upgrade = cards.value!.upgrades.find((u) => u.id === upgradeId);
          if (upgrade) {
            // Vaksai reduces each upgrade cost by 1 (minimum 0)
            let upgradeCost = upgrade.points;
            if (hasVaksai && upgrade.name !== "Vaksai") {
              upgradeCost = Math.max(0, upgradeCost - 1);
            }
            total += upgradeCost;
          }
        });
      }
    });

    return {
      total,
      isOverLimit: pointLimit !== undefined ? total > pointLimit : false,
    };
  }

  /**
   * Calculate points for a SquadReadDto
   */
  function calculateSquadReadPoints(
    squad: SquadReadDto,
    pointLimit?: number
  ): { total: number; isOverLimit: boolean } {
    return calculateSquadPoints(squad.ships, pointLimit);
  }

  return {
    calculateSquadPoints,
    calculateSquadReadPoints,
  };
};

