<script setup lang="ts">
import type { SquadReadResponseDto, SquadUpdateResponseDto } from '#shared/squad-dto';
import { Faction, factionOptions } from '#shared/enums';
import { FACTION_ICONS } from '#shared/xwing-icons';

const { selectedSquad, selectSquad, hasUnsavedChanges, closeDrawer, registerRefresh } = useSquadEditor();
const { data: response, pending, error, refresh } = await useFetch<SquadReadResponseDto>('/api/squads');

// Register refresh function so other components can trigger it
onMounted(() => {
  registerRefresh(refresh);
});

const selectedFaction = ref<Faction>(Faction.Rebel);
const creating = ref(false);
const createError = ref<string | null>(null);

// Filter squads by selected faction
const filteredSquads = computed(() => {
  if (!response.value) return [];
  return response.value.squads.filter(s => s.faction === selectedFaction.value);
});

// Faction icon colors for dropdown options
const factionIconColors = {
  [Faction.Rebel]: 'text-red-500',
  [Faction.Empire]: 'text-gray-400',
  [Faction.Scum]: 'text-amber-500'
};

// Handle faction change with unsaved changes check
async function handleFactionChange(event: Event) {
  const newFaction = (event.target as HTMLSelectElement).value as Faction;
  
  if (newFaction === selectedFaction.value) return;
  
  // Check for unsaved changes before switching
  if (hasUnsavedChanges.value) {
    const confirmed = confirm(
      'You have unsaved changes. Are you sure you want to switch factions? Your changes will be lost.'
    );
    
    if (!confirmed) {
      // Revert the select value
      nextTick(() => {
        selectedFaction.value = selectedFaction.value; // Force re-render
      });
      return;
    }
  }
  
  // Close the drawer and switch faction
  closeDrawer();
  selectedFaction.value = newFaction;
}

async function createEmptySquad() {
  creating.value = true;
  createError.value = null;

  try {
    const result = await $fetch<SquadUpdateResponseDto>('/api/squads', {
      method: 'POST',
      body: {
        name: `New ${selectedFaction.value} Squad`,
        faction: selectedFaction.value
      }
    });

    await refresh();
    
    const newSquad = response.value?.squads.find(s => s.id === result.id);
    if (newSquad) {
      selectSquad(newSquad);
    }
  } catch (e: any) {
    createError.value = e.data?.message || 'Failed to create squad';
  } finally {
    creating.value = false;
  }
}

function handleSquadClick(squad: any) {
  // Force reactivity by using nextTick
  nextTick(() => {
    selectSquad(squad);
  });
}

defineExpose({
  refresh
});
</script>
<template>
  <div class="h-full flex flex-col bg-gray-800">
    <div class="p-4 border-b border-gray-700 bg-gray-900">
      <div class="mb-3">
        <label for="faction" class="block text-xs font-medium mb-1.5 uppercase tracking-wide text-gray-400">
          Faction
        </label>
        <select
          id="faction"
          :value="selectedFaction"
          @change="handleFactionChange"
          class="w-full px-3 py-2 text-sm border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-800 text-gray-100"
        >
          <option
            v-for="option in factionOptions"
            :key="option.value"
            :value="option.value"
            class="flex items-center gap-2"
          >
            {{ option.label }}
          </option>
        </select>
        <div class="flex items-center gap-2 mt-2 text-sm text-gray-400">
          <span class="xwing-icon text-xl" :class="factionIconColors[selectedFaction]">
            {{ FACTION_ICONS[selectedFaction] }}
          </span>
          <span>{{ factionOptions.find(f => f.value === selectedFaction)?.label }}</span>
        </div>
      </div>

      <button
        @click="createEmptySquad"
        :disabled="creating"
        class="w-full px-4 py-2 text-sm font-semibold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ creating ? 'Creating...' : 'Create New Squad' }}
      </button>

      <div v-if="createError" class="mt-2 text-xs text-red-400">
        {{ createError }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-gray-800">
      <div class="p-4">
      <h2 class="text-sm font-bold mb-3 uppercase tracking-wide text-gray-400">Your Squads</h2>

      <div v-if="pending" class="text-center py-8 text-gray-400">
        Loading squads...
      </div>

      <div v-else-if="error" class="p-4 bg-red-900 border border-red-700 text-red-200">
        Failed to load squads
      </div>

      <div v-else-if="filteredSquads.length === 0" class="text-center py-8">
        <p class="text-gray-400 mb-2">No {{ selectedFaction }} squads yet</p>
        <p class="text-sm text-gray-500">Click "Create New Squad" to get started</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="squad in filteredSquads"
          :key="squad.id"
          @click="handleSquadClick(squad)"
        >
          <SquadCard 
            :squad="squad"
            :isSelected="selectedSquad?.id === squad.id"
          />
        </div>
      </div>
      </div>
    </div>
  </div>
</template>