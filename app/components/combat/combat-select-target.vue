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
}>();

const selectedAttacker = ref<string | null>(null);
const selectedDefender = ref<string | null>(null);

// Filter to ships that haven't attacked yet and aren't destroyed
const player1ShipsAvailable = computed(() => {
  return props.player1Ships
    .filter((s) => !s.ship.hasAttacked && !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

const player2ShipsAvailable = computed(() => {
  return props.player2Ships
    .filter((s) => !s.ship.hasAttacked && !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

const canDeclareAttack = computed(() => {
  return !!selectedAttacker.value && !!selectedDefender.value;
});

function selectAttacker(shipId: string) {
  selectedAttacker.value = selectedAttacker.value === shipId ? null : shipId;
}

function selectDefender(shipId: string) {
  selectedDefender.value = selectedDefender.value === shipId ? null : shipId;
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
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Combat Phase</h2>
      <p class="text-sm text-gray-400">
        Select an attacker (left) and a defender (right), then declare attack
      </p>
      <div
        v-if="selectedAttacker || selectedDefender"
        class="mt-3 flex items-center gap-4"
      >
        <div v-if="selectedAttacker" class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Attacker:</span>
          <span class="text-sm text-red-400 font-semibold">
            {{
              player1ShipsAvailable
                .concat(player2ShipsAvailable)
                .find((s) => s.ship.shipId === selectedAttacker)?.pilot
                ?.pilotName || "Unknown"
            }}
          </span>
        </div>
        <div v-if="selectedDefender" class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Defender:</span>
          <span class="text-sm text-teal-400 font-semibold">
            {{
              player1ShipsAvailable
                .concat(player2ShipsAvailable)
                .find((s) => s.ship.shipId === selectedDefender)?.pilot
                ?.pilotName || "Unknown"
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Ship Selection Grid -->
    <div class="flex-1 overflow-y-auto p-6">
      <div
        v-if="
          player1ShipsAvailable.length === 0 &&
          player2ShipsAvailable.length === 0
        "
        class="text-center py-12"
      >
        <p class="text-xl text-gray-400 mb-2">All ships have attacked!</p>
        <p class="text-sm text-gray-500">Ready to move to end phase.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Attackers Column (Left) - Player 1 & Player 2 -->
        <div class="space-y-2">
          <h3
            class="text-lg font-bold text-red-400 mb-4 sticky top-0 bg-gray-900 py-2 z-10"
          >
            Select Attacker
          </h3>

          <!-- Player 1 Attackers -->
          <div v-if="player1ShipsAvailable.length > 0" class="space-y-2 mb-6">
            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Player 1
            </div>
            <template
              v-for="{ ship, pilot } in player1ShipsAvailable"
              :key="ship.shipId"
            >
              <div
                @click="selectAttacker(ship.shipId)"
                class="p-4 border-2 cursor-pointer transition-all"
                :class="[
                  selectedAttacker === ship.shipId
                    ? 'border-red-500 bg-red-900/30'
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-red-400',
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
                </div>
              </div>
            </template>
          </div>

          <!-- Player 2 Attackers -->
          <div v-if="player2ShipsAvailable.length > 0" class="space-y-2">
            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Player 2
            </div>
            <template
              v-for="{ ship, pilot } in player2ShipsAvailable"
              :key="ship.shipId"
            >
              <div
                @click="selectAttacker(ship.shipId)"
                class="p-4 border-2 cursor-pointer transition-all"
                :class="[
                  selectedAttacker === ship.shipId
                    ? 'border-red-500 bg-red-900/30'
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-red-400',
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
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Defenders Column (Right) - Player 1 & Player 2 -->
        <div class="space-y-2">
          <h3
            class="text-lg font-bold text-teal-400 mb-4 sticky top-0 bg-gray-900 py-2 z-10"
          >
            Select Defender
          </h3>

          <!-- Player 1 Defenders -->
          <div v-if="player1ShipsAvailable.length > 0" class="space-y-2 mb-6">
            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Player 1
            </div>
            <template
              v-for="{ ship, pilot } in player1ShipsAvailable"
              :key="ship.shipId"
            >
              <div
                @click="selectDefender(ship.shipId)"
                class="p-4 border-2 cursor-pointer transition-all"
                :class="[
                  selectedDefender === ship.shipId
                    ? 'border-teal-500 bg-teal-900/30'
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-teal-400',
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
                </div>
              </div>
            </template>
          </div>

          <!-- Player 2 Defenders -->
          <div v-if="player2ShipsAvailable.length > 0" class="space-y-2">
            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Player 2
            </div>
            <template
              v-for="{ ship, pilot } in player2ShipsAvailable"
              :key="ship.shipId"
            >
              <div
                @click="selectDefender(ship.shipId)"
                class="p-4 border-2 cursor-pointer transition-all"
                :class="[
                  selectedDefender === ship.shipId
                    ? 'border-teal-500 bg-teal-900/30'
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-teal-400',
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
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-6 border-t border-gray-700 bg-gray-800">
      <div class="max-w-6xl mx-auto flex items-center justify-center gap-4">
        <button
          @click="noShot"
          class="px-8 py-3 text-sm font-bold bg-gray-600 text-white border-b-4 border-gray-800 hover:bg-gray-500 active:border-b-2 transition-all uppercase tracking-wide"
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
      </div>
    </div>
  </div>
</template>
