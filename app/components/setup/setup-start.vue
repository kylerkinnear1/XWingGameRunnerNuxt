<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import { getShipIcon, STAT_ICONS } from "#shared/xwing-icons";

interface ShipWithPilot {
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
}

const props = defineProps<{
  player1Ships: ShipWithPilot[];
  player2Ships: ShipWithPilot[];
  player1Id: string;
  player2Id: string;
  playerWithInitiative: string | null;
}>();

const emit = defineEmits<{
  placeShip: [shipId: string];
}>();

const player1ShipsSorted = computed(() => {
  return [...props.player1Ships].sort(
    (a, b) => a.ship.pilotSkill - b.ship.pilotSkill
  );
});

const player2ShipsSorted = computed(() => {
  return [...props.player2Ships].sort(
    (a, b) => a.ship.pilotSkill - b.ship.pilotSkill
  );
});

function placeShip(shipId: string) {
  emit("placeShip", shipId);
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Setup Phase</h2>
      <div v-if="playerWithInitiative" class="mt-3 flex items-center gap-2">
        <span class="text-sm text-gray-400">Player with Initiative:</span>
        <span
          class="px-3 py-1 rounded text-sm font-semibold"
          :class="
            playerWithInitiative === player1Id
              ? 'bg-red-600 text-white'
              : 'bg-gray-600 text-white'
          "
        >
          {{ playerWithInitiative === player1Id ? "Player 1" : "Player 2" }}
        </span>
      </div>
    </div>

    <!-- Ship List -->
    <div class="flex-1 overflow-y-auto p-6">
      <div
        v-if="
          player1ShipsSorted.every((s) => s.ship.isPlaced) &&
          player2ShipsSorted.every((s) => s.ship.isPlaced)
        "
        class="text-center py-12"
      >
        <p class="text-xl text-gray-400 mb-2">All ships placed!</p>
        <p class="text-sm text-gray-500">Ready to begin the game.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Player 1 Column -->
        <div class="space-y-2">
          <h3
            class="text-lg font-bold text-red-400 mb-4 top-0 bg-gray-900 py-2 z-10"
          >
            Player 1
          </h3>
          <template
            v-for="{ ship, pilot } in player1ShipsSorted"
            :key="ship.shipId"
          >
            <div
              v-if="!ship.isPlaced"
              @click="placeShip(ship.shipId)"
              class="p-4 border-2 border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-teal-500 transition-all cursor-pointer"
            >
              <div class="flex items-center gap-4">
                <!-- Pilot Skill Badge -->
                <div
                  class="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-red-600 text-white"
                >
                  {{ ship.pilotSkill }}
                </div>

                <!-- Ship Icon -->
                <span
                  v-if="pilot"
                  class="xwing-ship text-5xl shrink-0 text-red-400"
                >
                  {{ getShipIcon(pilot.shipType) }}
                </span>

                <!-- Ship Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-100">
                      {{ pilot?.pilotName || "Unknown" }}
                    </h3>
                  </div>

                  <!-- Stats -->
                  <div class="flex items-center gap-4 text-sm">
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-red-500">{{
                        STAT_ICONS.attack
                      }}</span>
                      <span class="font-medium">{{ ship.attack }}</span>
                    </span>
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-green-500">{{
                        STAT_ICONS.agility
                      }}</span>
                      <span class="font-medium">{{ ship.agility }}</span>
                    </span>
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-gray-400">{{
                        STAT_ICONS.hull
                      }}</span>
                      <span class="font-medium">{{ ship.hull }}</span>
                    </span>
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-blue-500">{{
                        STAT_ICONS.shield
                      }}</span>
                      <span class="font-medium">{{ ship.shields }}</span>
                    </span>
                  </div>
                </div>

                <!-- Place Button -->
                <button
                  class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded transition-colors shrink-0"
                  @click.stop="placeShip(ship.shipId)"
                >
                  Place Ship
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Player 2 Column -->
        <div class="space-y-2">
          <h3
            class="text-lg font-bold text-gray-400 mb-4 top-0 bg-gray-900 py-2 z-10"
          >
            Player 2
          </h3>
          <template
            v-for="{ ship, pilot } in player2ShipsSorted"
            :key="ship.shipId"
          >
            <div
              v-if="!ship.isPlaced"
              @click="placeShip(ship.shipId)"
              class="p-4 border-2 border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-teal-500 transition-all cursor-pointer"
            >
              <div class="flex items-center gap-4">
                <!-- Pilot Skill Badge -->
                <div
                  class="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-gray-600 text-white"
                >
                  {{ ship.pilotSkill }}
                </div>

                <!-- Ship Icon -->
                <span
                  v-if="pilot"
                  class="xwing-ship text-5xl shrink-0 text-gray-400"
                >
                  {{ getShipIcon(pilot.shipType) }}
                </span>

                <!-- Ship Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-100">
                      {{ pilot?.pilotName || "Unknown" }}
                    </h3>
                  </div>

                  <!-- Stats -->
                  <div class="flex items-center gap-4 text-sm">
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-red-500">{{
                        STAT_ICONS.attack
                      }}</span>
                      <span class="font-medium">{{ ship.attack }}</span>
                    </span>
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-green-500">{{
                        STAT_ICONS.agility
                      }}</span>
                      <span class="font-medium">{{ ship.agility }}</span>
                    </span>
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-gray-400">{{
                        STAT_ICONS.hull
                      }}</span>
                      <span class="font-medium">{{ ship.hull }}</span>
                    </span>
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-blue-500">{{
                        STAT_ICONS.shield
                      }}</span>
                      <span class="font-medium">{{ ship.shields }}</span>
                    </span>
                  </div>
                </div>

                <!-- Place Button -->
                <button
                  class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded transition-colors shrink-0"
                  @click.stop="placeShip(ship.shipId)"
                >
                  Place Ship
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
