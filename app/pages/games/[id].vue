<script setup lang="ts">
import type { GameStateDto } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import { calculateGameState } from "#shared/game-state/calculator";

const route = useRoute();
const gameId = route.params.id as string;

const { cards, loadCards } = useCards();

// Load cards first
await loadCards();

// Fetch game data
const {
  data: gameData,
  pending: gamePending,
  error: gameError,
} = await useFetch<GameStateDto>(`/api/games/${gameId}`);

// Fetch both squads
const squad1Promise = $fetch<{ squads: SquadReadDto[] }>(
  `/api/squads/${gameData.value?.player1SquadId}`
);
const squad2Promise = $fetch<{ squads: SquadReadDto[] }>(
  `/api/squads/${gameData.value?.player2SquadId}`
);

const [squad1Response, squad2Response] = await Promise.all([
  squad1Promise,
  squad2Promise,
]);

const squads = ref<SquadReadDto[]>([
  squad1Response.squads[0],
  squad2Response.squads[0],
]);

// Game state management
const selectedStepIndex = ref(0);
const gameStarted = ref(false);

const currentGameState = computed(() => {
  if (!gameData.value || !cards.value || !squads.value) return null;

  // Create a partial game state with only steps up to selected index
  const partialGameState: GameStateDto = {
    ...gameData.value,
    steps: gameData.value.steps.slice(0, selectedStepIndex.value + 1),
  };

  return calculateGameState(partialGameState, squads.value, cards.value);
});

function selectStep(index: number) {
  selectedStepIndex.value = index;
}

async function startGame() {
  // Call the start game API endpoint
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "game_start",
      timestamp: new Date(),
    },
  });

  // Refresh game data
  // In a real app, you'd refresh the gameData here

  gameStarted.value = true;
}
</script>

<template>
  <div class="h-full flex bg-gray-900 overflow-hidden">
    <!-- Left Sidebar - Game Steps -->
    <div
      class="w-80 flex-shrink-0 border-r border-gray-700 bg-gray-800 overflow-y-auto"
    >
      <div class="p-4 border-b border-gray-700 bg-gray-900">
        <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">
          Game Steps
        </h2>
        <p class="text-xs text-gray-500 mt-1">Click to replay to step</p>
      </div>

      <div v-if="gamePending" class="p-4 text-gray-400 text-sm">
        Loading game...
      </div>

      <div v-else-if="gameError" class="p-4 text-red-400 text-sm">
        Failed to load game
      </div>

      <div v-else-if="gameData" class="p-2">
        <div
          v-for="(step, index) in gameData.steps"
          :key="index"
          @click="selectStep(index)"
          class="p-3 mb-1 border cursor-pointer transition-all"
          :class="[
            selectedStepIndex === index
              ? 'border-teal-500 bg-gray-700 border-l-4'
              : 'border-gray-700 bg-gray-800 hover:bg-gray-750 border-l-2',
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-semibold text-gray-100 truncate">
                {{ step.type.replace(/_/g, " ").toUpperCase() }}
              </div>
              <div class="text-xs text-gray-500">Step {{ index + 1 }}</div>
            </div>
            <div class="text-xs text-gray-600">
              {{ new Date(step.timestamp).toLocaleTimeString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="flex-1 overflow-hidden">
      <!-- Start Game Animation -->
      <GameStartAnimation
        v-if="!gameStarted && squads.length === 2"
        :player1Squad="squads[0]"
        :player2Squad="squads[1]"
        @start="startGame"
      />

      <!-- Game Board (will be implemented next) -->
      <div
        v-else-if="gameStarted && currentGameState"
        class="h-full overflow-y-auto"
      >
        <!-- Ship management UI will go here -->
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-100">Game In Progress</h2>
          <p class="text-gray-400 mt-2">
            Current Phase: {{ currentGameState.currentPhase }}
          </p>
          <p class="text-gray-400">Turn: {{ currentGameState.totalTurns }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
