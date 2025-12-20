<script setup lang="ts">
import type { SquadReadDto } from '#shared/squad-dto';
import { Faction } from '#shared/enums';
import { FACTION_ICONS } from '#shared/xwing-icons';

const props = defineProps<{
  squad: SquadReadDto;
  isSelected?: boolean;
}>();

const factionColors = {
  [Faction.Rebel]: 'text-red-600',
  [Faction.Empire]: 'text-gray-700',
  [Faction.Scum]: 'text-orange-600'
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
    class="px-3 py-3 border border-gray-700 hover:bg-gray-700 transition-all cursor-pointer"
    :class="{ 'border-l-4 border-l-teal-500 bg-gray-700': isSelected }"
  >
    <div class="flex items-center gap-3">
      <span 
        class="xwing-icon text-2xl shrink-0"
        :class="factionColors[squad.faction]"
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