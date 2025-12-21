<script setup lang="ts">
import type { GameSummaryResponseDto } from "#shared/game-dto";

const {
  data: response,
  pending,
  error,
  refresh,
} = await useFetch<GameSummaryResponseDto>("/api/games");

const creating = ref(false);
const createError = ref<string | null>(null);

async function createNewGame() {
  creating.value = true;
  createError.value = null;

  try {
    const result = await $fetch("/api/games", {
      method: "post",
    });

    await refresh();

    // TODO: Navigate to game detail page
    // navigateTo(`/games/${result.id}`);
  } catch (e: any) {
    createError.value = e.data?.message || "Failed to create game";
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900">
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-100">Games</h1>
        <button
          @click="createNewGame"
          :disabled="creating"
          class="px-6 py-2 text-sm font-bold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
        >
          {{ creating ? "Creating..." : "Start New Game" }}
        </button>
      </div>

      <div
        v-if="createError"
        class="mt-3 p-3 bg-red-900 border border-red-700 text-red-200 text-sm"
      >
        {{ createError }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="pending" class="text-center py-8 text-gray-400">
        Loading games...
      </div>

      <div
        v-else-if="error"
        class="p-4 bg-red-900 border border-red-700 text-red-200"
      >
        Failed to load games
      </div>

      <div v-else-if="!response?.games.length" class="text-center py-8">
        <p class="text-gray-400 mb-2">No games yet</p>
        <p class="text-sm text-gray-500">Click "Start New Game" to begin</p>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="game in response.games"
          :key="game.id"
          class="p-4 border border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="font-semibold text-gray-100">Game</h3>
              <p class="text-xs text-gray-500">
                {{ new Date(game.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>

          <div class="space-y-1 text-sm text-gray-400">
            <div>Player 1: {{ game.player1Id }}</div>
            <div>Player 2: {{ game.player2Id }}</div>
          </div>

          <div class="mt-3 text-xs text-gray-500">
            Updated: {{ new Date(game.updatedAt).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
