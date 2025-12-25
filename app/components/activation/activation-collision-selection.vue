<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import { CollisionType, ManeuverDifficulty } from "#shared/enums";
import { getShipIcon, getBearingIcon } from "#shared/xwing-icons";

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
  <div class="h-full flex flex-col overflow-hidden relative z-10">
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
          <div v-if="ship.dialAssigned" class="flex items-center gap-2 mt-2">
            <span class="text-gray-400 text-sm">Dial:</span>
            <div class="flex items-center gap-1 px-3 py-1 bg-teal-900/30 border border-teal-700 rounded">
              <span
                class="xwing-icon text-2xl"
                :class="{
                  'text-green-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Green,
                  'text-gray-100': ship.dialAssigned.difficulty === ManeuverDifficulty.White,
                  'text-red-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Red,
                }"
              >
                {{ getBearingIcon(ship.dialAssigned.bearing) }}
              </span>
              <span
                class="text-xl font-bold"
                :class="{
                  'text-green-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Green,
                  'text-gray-100': ship.dialAssigned.difficulty === ManeuverDifficulty.White,
                  'text-red-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Red,
                }"
              >
                {{ ship.dialAssigned.speed }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Maneuver Result Options -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Dial Display - Large and Prominent -->
        <div v-if="ship.dialAssigned" class="mb-8 text-center">
          <div class="text-gray-400 text-sm uppercase tracking-wide mb-4">
            Selected Maneuver
          </div>
          <div class="flex items-center justify-center gap-4">
            <span
              class="xwing-icon text-7xl"
              :class="{
                'text-green-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Green,
                'text-gray-100': ship.dialAssigned.difficulty === ManeuverDifficulty.White,
                'text-red-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Red,
              }"
            >
              {{ getBearingIcon(ship.dialAssigned.bearing) }}
            </span>
            <span
              class="text-7xl font-bold"
              :class="{
                'text-green-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Green,
                'text-gray-100': ship.dialAssigned.difficulty === ManeuverDifficulty.White,
                'text-red-500': ship.dialAssigned.difficulty === ManeuverDifficulty.Red,
              }"
            >
              {{ ship.dialAssigned.speed }}
            </span>
          </div>
        </div>
        
        <!-- Successful Maneuver -->
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
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
