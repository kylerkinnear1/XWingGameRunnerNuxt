<script setup lang="ts">
import type { SquadReadDto } from '#shared/squad-dto';
import { Faction } from '#shared/enums';
import { FACTION_ICONS } from '#shared/xwing-icons';

const props = defineProps<{
  squad: SquadReadDto;
  isSelected?: boolean;
}>();

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

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
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
    <div class="flex items-center gap-3">
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
        <p class="text-xs text-gray-500">
          {{ formatDate(squad.updatedAt) }}
        </p>
      </div>
    </div>
  </div>
</template>