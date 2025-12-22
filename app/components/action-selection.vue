<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import { ActionType } from "#shared/enums";
import { getShipIcon, getActionIcon } from "#shared/xwing-icons";

const props = defineProps<{
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
  playerColor: "red" | "gray";
}>();

const emit = defineEmits<{
  performAction: [action: ActionType];
  skipAction: [];
}>();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};

// Get available actions from pilot
const availableActions = computed(() => {
  if (!props.pilot?.actions) return [];
  return props.pilot.actions;
});

function handlePerformAction(action: ActionType) {
  emit("performAction", action);
}

function handleSkipAction() {
  emit("skipAction");
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
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
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Skip Action - Prominent option -->
        <div>
          <button
            @click="handleSkipAction"
            class="w-full p-6 border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 text-gray-100 font-semibold text-lg transition-all hover:scale-[1.02]"
          >
            ⏭️ Skip Action
          </button>
        </div>

        <!-- Available Actions -->
        <div v-if="availableActions.length > 0">
          <h3
            class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3"
          >
            Perform Action
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="action in availableActions"
              :key="action"
              @click="handlePerformAction(action as ActionType)"
              class="p-4 border-2 border-teal-600 bg-teal-900/20 hover:bg-teal-900/40 hover:border-teal-500 transition-all text-center"
            >
              <div class="flex flex-col items-center gap-2">
                <span class="xwing-icon text-3xl text-teal-400">
                  {{ getActionIcon(action) }}
                </span>
                <span class="text-sm font-semibold text-gray-100">
                  {{ action }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <p class="mb-2">No actions available for this ship</p>
          <p class="text-sm">Skip to continue</p>
        </div>
      </div>
    </div>
  </div>
</template>
