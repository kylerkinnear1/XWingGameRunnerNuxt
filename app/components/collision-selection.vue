<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import { CollisionType } from "#shared/enums";
import { getShipIcon } from "#shared/xwing-icons";

const props = defineProps<{
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
  playerColor: "red" | "gray";
}>();

const emit = defineEmits<{
  successfulManeuver: [];
  collision: [collisionType: CollisionType, landedOnObstacle: boolean];
}>();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};

function handleSuccessfulManeuver() {
  emit("successfulManeuver");
}

function handleCollision(
  collisionType: CollisionType,
  landedOnObstacle: boolean = false
) {
  emit("collision", collisionType, landedOnObstacle);
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Execute Maneuver</h2>
      <div class="flex items-center gap-4 mt-3">
        <!-- Pilot Skill Badge -->
        <div
          class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-orange-600 text-white"
        >
          {{ ship.pilotSkill }}
        </div>

        <!-- Ship Icon -->
        <span
          v-if="pilot"
          class="xwing-ship text-4xl shrink-0"
          :class="colorClasses[playerColor]"
        >
          {{ getShipIcon(pilot.shipType) }}
        </span>

        <!-- Ship Name -->
        <div>
          <h3 class="text-lg font-semibold text-gray-100">
            {{ pilot?.pilotName || "Unknown" }}
          </h3>
          <!-- Assigned Dial Display -->
          <div v-if="ship.dialAssigned" class="flex items-center gap-2 text-sm">
            <span class="text-gray-400">Dial:</span>
            <span
              class="xwing-icon text-xl"
              :class="{
                'text-green-500': ship.dialAssigned.difficulty === 'green',
                'text-gray-100': ship.dialAssigned.difficulty === 'white',
                'text-red-500': ship.dialAssigned.difficulty === 'red',
              }"
            >
              {{
                (() => {
                  const bearingSymbols = {
                    straight: "8",
                    "bank-left": "7",
                    "bank-right": "9",
                    "turn-left": "4",
                    "turn-right": "6",
                    "k-turn": "K",
                    "sloop-left": "1",
                    "sloop-right": "3",
                    "tallon-roll-left": ":",
                    "tallon-roll-right": ";",
                    stationary: "5",
                    reverse: "S",
                  };
                  return bearingSymbols[ship.dialAssigned.bearing];
                })()
              }}
            </span>
            <span
              class="text-lg font-bold"
              :class="{
                'text-green-500': ship.dialAssigned.difficulty === 'green',
                'text-gray-100': ship.dialAssigned.difficulty === 'white',
                'text-red-500': ship.dialAssigned.difficulty === 'red',
              }"
            >
              {{ ship.dialAssigned.speed }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Maneuver Result Options -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Successful Maneuver - Top Layer -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3"
          >
            Clean Maneuver
          </h3>
          <button
            @click="handleSuccessfulManeuver"
            class="w-full p-6 border-2 border-green-600 bg-green-900/20 hover:bg-green-900/40 text-green-100 font-semibold text-lg transition-all hover:scale-[1.02]"
          >
            ✓ Successful Maneuver (No Collision)
          </button>
        </div>

        <!-- Collision Options - Bottom Layer -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3"
          >
            Collisions
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Asteroid -->
            <button
              @click="handleCollision(CollisionType.Asteroid, true)"
              class="p-4 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-orange-500 transition-all text-left"
            >
              <div class="font-semibold text-gray-100 mb-1">🪨 Asteroid</div>
              <div class="text-xs text-gray-400">
                Roll for damage, skip action
              </div>
            </button>

            <!-- Debris -->
            <button
              @click="handleCollision(CollisionType.Debris, true)"
              class="p-4 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-orange-500 transition-all text-left"
            >
              <div class="font-semibold text-gray-100 mb-1">💥 Debris</div>
              <div class="text-xs text-gray-400">Gain stress token</div>
            </button>

            <!-- Gas Cloud -->
            <button
              @click="handleCollision(CollisionType.GasCloud, true)"
              class="p-4 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-orange-500 transition-all text-left"
            >
              <div class="font-semibold text-gray-100 mb-1">☁️ Gas Cloud</div>
              <div class="text-xs text-gray-400">Gain strain token</div>
            </button>

            <!-- Mine -->
            <button
              @click="handleCollision(CollisionType.Mine, true)"
              class="p-4 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-orange-500 transition-all text-left"
            >
              <div class="font-semibold text-gray-100 mb-1">⚠️ Mine</div>
              <div class="text-xs text-gray-400">
                Detonate mine, take damage
              </div>
            </button>

            <!-- Ship Collision -->
            <button
              @click="handleCollision(CollisionType.Ship, false)"
              class="p-4 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-red-500 transition-all text-left md:col-span-2"
            >
              <div class="font-semibold text-gray-100 mb-1">
                🚀 Ship Collision (Bump)
              </div>
              <div class="text-xs text-gray-400">
                Skip action phase for both ships
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
