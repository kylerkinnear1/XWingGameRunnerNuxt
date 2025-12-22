<script setup lang="ts">
import type { SquadReadDto } from "#shared/squad-dto";
import { FACTION_ICONS } from "#shared/xwing-icons";

const props = defineProps<{
  player1Squad: SquadReadDto;
  player2Squad: SquadReadDto;
  player1Id: string;
  player2Id: string;
}>();

const emit = defineEmits<{
  selectInitiative: [playerId: string];
}>();

function selectPlayer(playerId: string) {
  emit("selectInitiative", playerId);
}
</script>

<template>
  <div
    class="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="w-full max-w-4xl px-8">
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold text-gray-100 mb-2">Select Initiative</h2>
        <p class="text-gray-400 text-lg">
          Choose which player will have initiative for this game
        </p>
      </div>

      <div class="grid grid-cols-2 gap-8">
        <!-- Player 1 Option -->
        <button
          @click="selectPlayer(player1Id)"
          class="group relative bg-gray-800/80 backdrop-blur border-2 border-red-900 p-8 hover:border-red-600 hover:bg-gray-700/80 transition-all shadow-xl hover:shadow-red-500/20"
        >
          <div class="flex items-center gap-4 mb-4">
            <span class="xwing-icon text-5xl text-red-500">
              {{ FACTION_ICONS[player1Squad.faction] }}
            </span>
            <div class="flex-1 text-left">
              <h3 class="font-bold text-2xl text-gray-100">
                {{ player1Squad.name }}
              </h3>
              <p class="text-sm text-gray-400">Player 1</p>
            </div>
          </div>
          <div class="text-center">
            <div
              class="inline-block px-6 py-3 bg-red-600 text-white font-bold text-lg uppercase tracking-wide group-hover:bg-red-500 transition-colors"
            >
              Select Initiative
            </div>
          </div>
        </button>

        <!-- Player 2 Option -->
        <button
          @click="selectPlayer(player2Id)"
          class="group relative bg-gray-800/80 backdrop-blur border-2 border-gray-600 p-8 hover:border-gray-400 hover:bg-gray-700/80 transition-all shadow-xl hover:shadow-gray-500/20"
        >
          <div class="flex items-center gap-4 mb-4">
            <span class="xwing-icon text-5xl text-gray-400">
              {{ FACTION_ICONS[player2Squad.faction] }}
            </span>
            <div class="flex-1 text-left">
              <h3 class="font-bold text-2xl text-gray-100">
                {{ player2Squad.name }}
              </h3>
              <p class="text-sm text-gray-400">Player 2</p>
            </div>
          </div>
          <div class="text-center">
            <div
              class="inline-block px-6 py-3 bg-gray-600 text-white font-bold text-lg uppercase tracking-wide group-hover:bg-gray-500 transition-colors"
            >
              Select Initiative
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
