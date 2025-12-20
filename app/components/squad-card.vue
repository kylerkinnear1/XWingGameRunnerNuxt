<script setup lang="ts">
import type { SquadReadDto } from '#shared/squad-dto';
import { Faction } from '#shared/enums';
import { FACTION_ICONS, getShipIcon } from '#shared/xwing-icons';

const props = defineProps<{
  squad: SquadReadDto;
  isSelected?: boolean;
  pointLimit?: number;
}>();

const { cards } = useCards();

const factionIconColors = {
  [Faction.Rebel]: 'text-red-500',
  [Faction.Empire]: 'text-gray-400',
  [Faction.Scum]: 'text-amber-500'
};

const factionBgColors = {
  [Faction.Rebel]: 'bg-red-950/50 border-red-800',
  [Faction.Empire]: 'bg-gray-800 border-gray-700',
  [Faction.Scum]: 'bg-amber-950/50 border-amber-800'
};

const factionHoverColors = {
  [Faction.Rebel]: 'hover:bg-red-800/60 hover:border-red-600',
  [Faction.Empire]: 'hover:bg-gray-700 hover:border-gray-600',
  [Faction.Scum]: 'hover:bg-amber-800/60 hover:border-amber-600'
};

const factionSelectedColors = {
  [Faction.Rebel]: 'bg-red-800/70 border-l-red-400',
  [Faction.Empire]: 'bg-gray-700 border-l-gray-300',
  [Faction.Scum]: 'bg-amber-800/70 border-l-amber-400'
};

const squadDetails = computed(() => {
  if (!cards.value || !props.squad.pilots.length) {
    return { ships: [], totalPoints: 0, isOverLimit: false };
  }

  const ships: string[] = [];
  let totalPoints = 0;

  props.squad.pilots.forEach(pilot => {
    const card = cards.value!.pilots.find(p => p.id === pilot.pilotId);
    if (card) {
      ships.push(card.shipType);
      totalPoints += card.points;
      
      // Add upgrade points
      pilot.upgradeIds?.forEach(upgradeId => {
        const upgrade = cards.value!.upgrades.find(u => u.id === upgradeId);
        if (upgrade) {
          totalPoints += upgrade.points;
        }
      });
    }
  });

  return {
    ships,
    totalPoints,
    isOverLimit: props.pointLimit ? totalPoints > props.pointLimit : false
  };
});

</script> 
<template>
  <div 
    class="px-3 py-3 border transition-all cursor-pointer border-l-4"
    :class="[
      factionBgColors[squad.faction],
      factionHoverColors[squad.faction],
      isSelected ? factionSelectedColors[squad.faction] : ''
    ]"
  >
    <div class="flex items-start gap-3">
      <span 
        class="xwing-icon text-2xl shrink-0"
        :class="factionIconColors[squad.faction]"
      >
        {{ FACTION_ICONS[squad.faction] }}
      </span>
      
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-sm truncate text-gray-100">
          {{ squad.name }}
        </h3>
        
        <!-- Ship Icons -->
        <div v-if="squadDetails.ships.length > 0" class="flex gap-1 mt-1 flex-wrap">
          <span
            v-for="(ship, index) in squadDetails.ships"
            :key="`${ship}-${index}`"
            class="xwing-ship text-gray-400 text-5xl"
            :title="ship"
          >
            {{ getShipIcon(ship) }}
          </span>
        </div>

      </div>
      
      <!-- Point Counter -->
      <div class="shrink-0 text-right">
        <div 
          class="font-bold text-sm"
          :class="squadDetails.isOverLimit ? 'text-red-400' : 'text-teal-400'"
        >
          {{ squadDetails.totalPoints }}
        </div>
        <div v-if="pointLimit" class="text-xs text-gray-500">
          / {{ pointLimit }}
        </div>
      </div>
    </div>
  </div>
</template>