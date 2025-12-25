<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import type { ActionType } from "#shared/enums";
import { getShipIcon } from "#shared/xwing-icons";

const props = defineProps<{
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
  playerColor: "red" | "gray";
}>();

const emit = defineEmits<{
  performAction: [action: ActionType];
  skipAction: [];
  doneWithActions: [];
}>();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative z-10">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Action Phase</h2>
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
        </div>
      </div>
    </div>

    <!-- Action Options -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto flex items-center justify-center">
        <AppButton
          variant="primary"
          size="lg"
          @click="emit('doneWithActions')"
          class="w-full max-w-md p-6 bg-teal-900/20 hover:bg-teal-900/40 border-teal-600 hover:border-teal-500 text-teal-100 hover:scale-[1.02]"
        >
          Done with Actions
        </AppButton>
      </div>
    </div>
  </div>
</template>
