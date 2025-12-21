import type { UpgradeDto, PilotDto as CardPilotDto } from '#shared/cards';
import type { PilotDto } from '#shared/squad-dto';

export const useUpgrades = () => {
  const { cards } = useCards();

  /**
   * Get upgrades compatible with a specific slot type
   */
  function getUpgradesForSlot(slotType: string, pilotCard: CardPilotDto): UpgradeDto[] {
    if (!cards.value) return [];

    return cards.value.upgrades.filter(upgrade => {
      // Check if upgrade matches this slot type
      const matchesSlot = upgrade.upgradeType === slotType || 
                         upgrade.slotsRequired.includes(slotType);
      
      if (!matchesSlot) return false;

      // Check faction restrictions if any
      if (upgrade.restrictions?.factions && upgrade.restrictions.factions.length > 0) {
        if (!upgrade.restrictions.factions.includes(pilotCard.factionKey)) {
          return false;
        }
      }

      // Check ship restrictions if any
      if (upgrade.restrictions?.ships && upgrade.restrictions.ships.length > 0) {
        if (!upgrade.restrictions.ships.includes(pilotCard.shipKey)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get all available upgrade slots for a pilot, accounting for already-used slots
   */
  function getAvailableSlots(pilotCard: CardPilotDto, currentUpgrades: string[]): string[] {
    if (!cards.value) return [];
    
    // Create mutable copy of base slots
    const baseSlots = [...pilotCard.upgradeSlots];
    const usedSlots: string[] = [];

    // Track which slots are used by current upgrades
    currentUpgrades.forEach(upgradeId => {
      const upgrade = cards.value!.upgrades.find(u => u.id === upgradeId);
      if (upgrade) {
        // An upgrade can require multiple slots - convert readonly to mutable
        upgrade.slotsRequired.forEach(slot => {
          usedSlots.push(slot);
        });
      }
    });

    // Remove used slots from available
    const available = [...baseSlots];
    usedSlots.forEach(usedSlot => {
      const index = available.indexOf(usedSlot);
      if (index > -1) {
        available.splice(index, 1);
      }
    });

    return available;
  }

  /**
   * Get upgrade details by ID
   */
  function getUpgrade(upgradeId: string): UpgradeDto | undefined {
    if (!cards.value) return undefined;
    return cards.value.upgrades.find(u => u.id === upgradeId);
  }

  /**
   * Check if an upgrade can be added (not unique or not already in squad)
   */
  function canAddUpgrade(upgradeId: string, squadPilots: PilotDto[]): boolean {
    if (!cards.value) return false;
    
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) return false;

    // Non-unique upgrades can always be added
    if (!upgrade.isUnique) return true;

    // Check if this unique upgrade is already in the squad
    const isInSquad = squadPilots.some(pilot => 
      pilot.upgradeIds.includes(upgradeId)
    );

    return !isInSquad;
  }

  /**
   * Get all upgrades (for custom picker)
   */
  function getAllUpgrades(): readonly UpgradeDto[] {
    return cards.value?.upgrades || [];
  }

  return {
    getUpgradesForSlot,
    getAvailableSlots,
    getUpgrade,
    canAddUpgrade,
    getAllUpgrades
  };
};