<script setup lang="ts">
import type { CurrentGameState } from "#shared/game-state-dto";

const props = defineProps<{
  currentGameState: CurrentGameState | null;
}>();
</script>

<template>
  <div v-if="currentGameState" class="h-full overflow-y-auto">
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-100">Game In Progress</h2>
      <p class="text-gray-400 mt-2">
        Current Phase: {{ currentGameState.currentPhase }}
      </p>
      <p class="text-gray-400">Turn: {{ currentGameState.totalTurns }}</p>
    </div>
  </div>
</template>
