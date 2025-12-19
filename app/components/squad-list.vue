<script setup lang="ts">
import type { SquadReadResponseDto, SquadUpdateResponseDto } from '#shared/squad-dto';
import { Faction, factionOptions } from '#shared/enums';

const { data: response, pending, error, refresh } = await useFetch<SquadReadResponseDto>('/api/squads');

const selectedFaction = ref<Faction>(Faction.Rebel);
const creating = ref(false);
const createError = ref<string | null>(null);

// Faction background colors
const factionBgColors = {
  [Faction.Rebel]: 'bg-red-50 border-red-200',
  [Faction.Empire]: 'bg-gray-50 border-gray-200',
  [Faction.Scum]: 'bg-orange-50 border-orange-200'
};

async function createEmptySquad() {
  creating.value = true;
  createError.value = null;

  try {
    await $fetch<SquadUpdateResponseDto>('/api/squads', {
      method: 'POST',
      body: {
        name: `New ${selectedFaction.value} Squad`,
        faction: selectedFaction.value
      }
    });

    // Refresh the list to show new squad
    await refresh();
  } catch (e: any) {
    createError.value = e.data?.message || 'Failed to create squad';
  } finally {
    creating.value = false;
  }
}

// Expose refresh for parent components
defineExpose({
  refresh
});
</script>

<template>
  <div class="border rounded-lg transition-colors" :class="factionBgColors[selectedFaction]">
    <div class="p-4 border-b" :class="factionBgColors[selectedFaction]">
      <!-- Faction Selector -->
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

      <!-- Create Button -->
      <button
        @click="createEmptySquad"
        :disabled="creating"
        class="w-full app-button"
      >
        {{ creating ? 'Creating...' : 'Create List' }}
      </button>

      <!-- Create Error -->
      <div v-if="createError" class="mt-2 text-sm text-red-600">
        {{ createError }}
      </div>
    </div>

    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Your Squads</h2>

      <!-- Loading State -->
      <div v-if="pending" class="text-center py-8 text-gray-500">
        Loading squads...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load squads
      </div>

      <!-- Empty State -->
      <div v-else-if="!response || response.squads.length === 0" class="text-center py-8">
        <p class="text-gray-500 mb-4">No squads yet</p>
        <p class="text-sm text-gray-400">Select a faction and click "Create List"</p>
      </div>

      <!-- Squad List -->
      <div v-else class="space-y-3">
        <SquadCard
          v-for="squad in response.squads"
          :key="squad.id"
          :squad="squad"
        />
      </div>
    </div>
  </div>
</template>