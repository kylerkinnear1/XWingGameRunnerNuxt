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
}>();

const emit = defineEmits<{
  declareAttack: [attackerShipId: string, defenderShipId: string];
  noShot: [];
  moveToCleanup: [];
}>();

const selectedAttacker = ref<string | null>(null);
const selectedDefender = ref<string | null>(null);

// Show all ships (not destroyed), sorted by pilot skill
// Ships that have already shot are still selectable but visually marked
const player1ShipsAvailable = computed(() => {
  return props.player1Ships
    .filter((s) => !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

const player2ShipsAvailable = computed(() => {
  return props.player2Ships
    .filter((s) => !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

const canDeclareAttack = computed(() => {
  return !!selectedAttacker.value && !!selectedDefender.value;
});

const canNoShot = computed(() => {
  return !!selectedAttacker.value;
});

function selectAttacker(shipId: string) {
  if (selectedAttacker.value === shipId) {
    selectedAttacker.value = null;
  } else {
    selectedAttacker.value = shipId;
  }
}

function selectDefender(shipId: string) {
  if (selectedDefender.value === shipId) {
    selectedDefender.value = null;
  } else {
    selectedDefender.value = shipId;
  }
}

function declareAttack() {
  if (canDeclareAttack.value) {
    emit("declareAttack", selectedAttacker.value!, selectedDefender.value!);
    // Reset selections after declaring attack
    selectedAttacker.value = null;
    selectedDefender.value = null;
  }
}

function noShot() {
  emit("noShot");
  selectedAttacker.value = null;
  selectedDefender.value = null;
}

function moveToCleanup() {
  emit("moveToCleanup");
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Combat Phase</h2>
    </div>

    <!-- Ship Selection Grid -->
    <div class="flex-1 overflow-y-auto p-6">
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
      >
        <!-- Player 1 Ships (Left Column) -->
        <div class="space-y-3">
          <h3
            class="text-lg font-bold text-red-400 mb-4 sticky top-0 bg-gray-900 py-2 z-10"
          >
            Player 1
          </h3>
          <div
            v-if="player1ShipsAvailable.length === 0"
            class="text-center py-8"
          >
            <p class="text-sm text-gray-500">No ships available</p>
          </div>
          <template
            v-for="{ ship, pilot } in player1ShipsAvailable"
            :key="ship.shipId"
          >
            <div
              class="p-4 border-2 transition-all"
              :class="[
                selectedAttacker === ship.shipId
                  ? 'border-red-500 bg-red-900/20'
                  : selectedDefender === ship.shipId
                  ? 'border-teal-500 bg-teal-900/20'
                  : ship.hasAttacked
                  ? 'border-yellow-600 bg-yellow-900/10 opacity-75'
                  : 'border-gray-700 bg-gray-800',
              ]"
            >
              <div class="flex items-center gap-4">
                <!-- Pilot Skill Badge -->
                <div
                  class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-orange-600 text-white"
                >
                  {{ ship.pilotSkill }}
                </div>

                <!-- Ship Icon -->
                <span
                  v-if="pilot"
                  class="xwing-ship text-4xl shrink-0 text-red-400"
                >
                  {{ getShipIcon(pilot.shipType) }}
                </span>

                <!-- Ship Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-semibold text-gray-100 mb-1">
                    {{ pilot?.pilotName || "Unknown" }}
                  </h3>

                  <!-- Stats -->
                  <div class="flex items-center gap-3 text-xs">
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

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click="selectAttacker(ship.shipId)"
                    class="px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
                    :class="[
                      selectedAttacker === ship.shipId
                        ? 'bg-red-600 border-red-800'
                        : 'bg-gray-600 border-gray-800 hover:bg-gray-500',
                    ]"
                  >
                    Attack
                  </button>
                  <button
                    @click="selectDefender(ship.shipId)"
                    class="px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
                    :class="[
                      selectedDefender === ship.shipId
                        ? 'bg-teal-600 border-teal-800'
                        : 'bg-gray-600 border-gray-800 hover:bg-gray-500',
                    ]"
                  >
                    Defend
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Player 2 Ships (Right Column) -->
        <div class="space-y-3">
          <h3
            class="text-lg font-bold text-gray-400 mb-4 sticky top-0 bg-gray-900 py-2 z-10"
          >
            Player 2
          </h3>
          <div
            v-if="player2ShipsAvailable.length === 0"
            class="text-center py-8"
          >
            <p class="text-sm text-gray-500">No ships available</p>
          </div>
          <template
            v-for="{ ship, pilot } in player2ShipsAvailable"
            :key="ship.shipId"
          >
            <div
              class="p-4 border-2 transition-all"
              :class="[
                selectedAttacker === ship.shipId
                  ? 'border-red-500 bg-red-900/20'
                  : selectedDefender === ship.shipId
                  ? 'border-teal-500 bg-teal-900/20'
                  : ship.hasAttacked
                  ? 'border-yellow-600 bg-yellow-900/10 opacity-75'
                  : 'border-gray-700 bg-gray-800',
              ]"
            >
              <div class="flex items-center gap-4">
                <!-- Pilot Skill Badge -->
                <div
                  class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-orange-600 text-white"
                >
                  {{ ship.pilotSkill }}
                </div>

                <!-- Ship Icon -->
                <span
                  v-if="pilot"
                  class="xwing-ship text-4xl shrink-0 text-gray-400"
                >
                  {{ getShipIcon(pilot.shipType) }}
                </span>

                <!-- Ship Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-base font-semibold text-gray-100">
                      {{ pilot?.pilotName || "Unknown" }}
                    </h3>
                    <span
                      v-if="ship.hasAttacked"
                      class="text-xs px-2 py-0.5 bg-yellow-600 text-yellow-100 rounded uppercase tracking-wide"
                    >
                      Already Shot
                    </span>
                  </div>

                  <!-- Stats -->
                  <div class="flex items-center gap-3 text-xs">
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

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click="selectAttacker(ship.shipId)"
                    class="px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
                    :class="[
                      selectedAttacker === ship.shipId
                        ? 'bg-red-600 border-red-800'
                        : 'bg-gray-600 border-gray-800 hover:bg-gray-500',
                    ]"
                  >
                    Attack
                  </button>
                  <button
                    @click="selectDefender(ship.shipId)"
                    class="px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
                    :class="[
                      selectedDefender === ship.shipId
                        ? 'bg-teal-600 border-teal-800'
                        : 'bg-gray-600 border-gray-800 hover:bg-gray-500',
                    ]"
                  >
                    Defend
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-6 border-t border-gray-700 bg-gray-800">
      <div class="max-w-4xl mx-auto flex items-center justify-center gap-4">
        <button
          @click="noShot"
          :disabled="!canNoShot"
          class="px-8 py-3 text-sm font-bold bg-gray-600 text-white border-b-4 border-gray-800 hover:bg-gray-500 active:border-b-2 transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          No Shot
        </button>
        <button
          @click="declareAttack"
          :disabled="!canDeclareAttack"
          class="px-8 py-3 text-sm font-bold bg-red-600 text-white border-b-4 border-red-800 hover:bg-red-500 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
        >
          Declare Attack
        </button>
        <button
          @click="moveToCleanup"
          class="px-8 py-3 text-sm font-bold bg-blue-600 text-white border-b-4 border-blue-800 hover:bg-blue-500 active:border-b-2 transition-all uppercase tracking-wide"
        >
          Move to Cleanup
        </button>
      </div>
    </div>
  </div>
</template>
