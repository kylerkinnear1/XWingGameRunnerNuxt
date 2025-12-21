<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import type { TokenType } from "#shared/enums";
import { getShipIcon, STAT_ICONS, getActionIcon } from "#shared/xwing-icons";

const props = defineProps<{
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
  isExpanded: boolean;
  playerColor: "red" | "gray";
}>();

const emit = defineEmits<{
  toggleExpansion: [shipId: string];
}>();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};

function handleToggle() {
  emit("toggleExpansion", props.ship.shipId);
}
</script>

<template>
  <div
    class="mb-2 border border-gray-700 bg-gray-800 hover:border-teal-500 transition-all relative"
  >
    <div @click="handleToggle" class="p-3 cursor-pointer">
      <div class="flex items-start gap-3">
        <!-- Ship Icon & PS -->
        <div class="flex flex-col items-center gap-1 shrink-0">
          <span
            v-if="pilot"
            class="xwing-ship text-3xl"
            :class="colorClasses[playerColor]"
          >
            {{ getShipIcon(pilot.shipType) }}
          </span>
          <span class="text-2xl font-bold text-orange-500">
            {{ ship.pilotSkill }}
          </span>
        </div>

        <!-- Ship Details -->
        <div class="flex-1 min-w-0">
          <!-- Pilot Name -->
          <div class="text-sm font-semibold text-gray-100 mb-2">
            {{ pilot?.pilotName || "Unknown" }}
          </div>

          <!-- Stats Row -->
          <div class="flex items-center gap-3 text-xs mb-2">
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

          <!-- Action Bar -->
          <div
            v-if="pilot?.actions && pilot.actions.length > 0"
            class="flex items-center gap-1 mb-2"
          >
            <span
              v-for="action in pilot.actions"
              :key="action"
              class="xwing-icon text-sm text-gray-400"
              :title="action"
            >
              {{ getActionIcon(action) }}
            </span>
          </div>

          <!-- Pilot Ability -->
          <div
            v-if="pilot?.ability"
            class="text-xs text-gray-400 italic leading-relaxed"
          >
            {{ pilot.ability }}
          </div>
        </div>

        <!-- Expand Arrow -->
        <svg
          class="w-5 h-5 text-gray-400 shrink-0 transition-transform"
          :class="isExpanded ? 'rotate-90' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
