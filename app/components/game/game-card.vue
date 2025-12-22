<script setup lang="ts">
import type { GameSummaryDto } from "#shared/game-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import { getShipIcon } from "#shared/xwing-icons";

const props = defineProps<{
  game: GameSummaryDto;
  player1Squad?: SquadReadDto;
  player2Squad?: SquadReadDto;
  isSelected?: boolean;
}>();

const { cards } = useCards();

const player1Ships = computed(() => {
  if (!cards.value || !props.player1Squad) return [];

  return props.player1Squad.ships
    .map((ship) => {
      const pilot = cards.value!.pilots.find((p) => p.id === ship.pilotId);
      return pilot?.shipType || "";
    })
    .filter(Boolean);
});

const player2Ships = computed(() => {
  if (!cards.value || !props.player2Squad) return [];

  return props.player2Squad.ships
    .map((ship) => {
      const pilot = cards.value!.pilots.find((p) => p.id === ship.pilotId);
      return pilot?.shipType || "";
    })
    .filter(Boolean);
});
</script>

<template>
  <div
    class="p-4 border transition-all cursor-pointer"
    :class="[
      isSelected
        ? 'border-teal-500 bg-gray-700 border-l-4'
        : 'border-gray-700 bg-gray-800 hover:bg-gray-750 border-l-2',
    ]"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <div class="text-sm font-semibold text-gray-100">
          {{ player1Squad?.name || "Squad 1" }} vs
          {{ player2Squad?.name || "Squad 2" }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ new Date(game.createdAt).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <!-- Player 1 Ships -->
    <div v-if="player1Ships.length > 0" class="mb-2">
      <div class="text-xs text-gray-400 mb-1">{{ player1Squad?.name }}</div>
      <div class="flex gap-1 flex-wrap">
        <span
          v-for="(ship, index) in player1Ships"
          :key="`p1-${ship}-${index}`"
          class="xwing-ship text-red-400 text-3xl"
          :title="ship"
        >
          {{ getShipIcon(ship) }}
        </span>
      </div>
    </div>

    <!-- Player 2 Ships -->
    <div v-if="player2Ships.length > 0">
      <div class="text-xs text-gray-400 mb-1">{{ player2Squad?.name }}</div>
      <div class="flex gap-1 flex-wrap">
        <span
          v-for="(ship, index) in player2Ships"
          :key="`p2-${ship}-${index}`"
          class="xwing-ship text-gray-400 text-3xl"
          :title="ship"
        >
          {{ getShipIcon(ship) }}
        </span>
      </div>
    </div>

    <div class="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
      Updated: {{ new Date(game.updatedAt).toLocaleString() }}
    </div>
  </div>
</template>
