<script setup lang="ts">
import type { SquadReadDto } from '#shared/squad-dto';
import { Faction } from '#shared/enums';

const props = defineProps<{
    squad: SquadReadDto
}>();

const factionColors = {
    [Faction.Rebel]: 'bg-red-100 text-red-800 border-red-200',
    [Faction.Empire]: 'bg-gray-100 text-gray-800 border-gray-200',
    [Faction.Scum]: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const factionLabels = {
    [Faction.Rebel]: 'Rebel',
    [Faction.Empire]: 'Empire',
    [Faction.Scum]: 'Scum'
};

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
    });
}
</script>

<template>
    <div class="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
    <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-lg truncate">
            {{ squad.name }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">
            Updated {{ formatDate(squad.updatedAt) }}
        </p>
        </div>
        
        <span 
        class="px-3 py-1 text-xs font-medium rounded-full border shrink-0"
        :class="factionColors[squad.faction]"
        >
        {{ factionLabels[squad.faction] }}
        </span>
    </div>
    </div>
</template>