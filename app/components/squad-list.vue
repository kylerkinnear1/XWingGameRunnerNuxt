<script setup lang="ts">
import type { SquadReadResponseDto, SquadUpdateResponseDto } from '#shared/squad-dto';
import { Faction, factionOptions } from '#shared/enums';

const { selectedSquad, selectSquad, registerRefresh } = useSquadEditor();
const { data: response, pending, error, refresh } = await useFetch<SquadReadResponseDto>('/api/squads');

// Register refresh function so other components can trigger it
onMounted(() => {
  registerRefresh(refresh);
});

const selectedFaction = ref<Faction>(Faction.Rebel);
const creating = ref(false);
const createError = ref<string | null>(null);

const factionBgColors = {
  [Faction.Rebel]: 'bg-red-50 border-red-200',
  [Faction.Empire]: 'bg-gray-50 border-gray-200',
  [Faction.Scum]: 'bg-orange-50 border-orange-200'
};

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
  selectSquad(squad);
}

defineExpose({
  refresh
});
</script>
<template>
  <div class="border rounded-lg transition-colors" :class="factionBgColors[selectedFaction]">
    <div class="p-4 border-b" :class="factionBgColors[selectedFaction]">
      <div class="mb-4">
        <label for="faction" class="block text-sm font-medium mb-2">
          Faction
        </label>
        <select
          id="faction"
          v-model="selectedFaction"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
        >
          <option
            v-for="option in factionOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <button
        @click="createEmptySquad"
        :disabled="creating"
        class="w-full app-button"
      >
        {{ creating ? 'Creating...' : 'Create List' }}
      </button>

      <div v-if="createError" class="mt-2 text-sm text-red-600">
        {{ createError }}
      </div>
    </div>

    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Your Squads</h2>

      <div v-if="pending" class="text-center py-8 text-gray-500">
        Loading squads...
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load squads
      </div>

      <div v-else-if="!response || response.squads.length === 0" class="text-center py-8">
        <p class="text-gray-500 mb-4">No squads yet</p>
        <p class="text-sm text-gray-400">Select a faction and click "Create List"</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="squad in response.squads"
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
</template>