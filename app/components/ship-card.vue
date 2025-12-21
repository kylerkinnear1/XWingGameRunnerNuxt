<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import type { TokenType } from "#shared/enums";
import { getShipIcon, STAT_ICONS } from "#shared/xwing-icons";

const props = defineProps<{
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
  isExpanded: boolean;
  playerColor: "red" | "gray";
}>();

const emit = defineEmits<{
  toggleExpansion: [shipId: string];
  addToken: [shipId: string, tokenType: TokenType];
  removeToken: [shipId: string, tokenType: TokenType];
}>();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};

function handleToggle() {
  emit("toggleExpansion", props.ship.shipId);
}

function handleAddToken(shipId: string, tokenType: TokenType) {
  emit("addToken", shipId, tokenType);
}

function handleRemoveToken(shipId: string, tokenType: TokenType) {
  emit("removeToken", shipId, tokenType);
}
</script>

<template>
  <div
    class="mb-2 border border-gray-700 bg-gray-800 hover:border-teal-500 transition-all"
  >
    <div @click="handleToggle" class="p-3 cursor-pointer">
      <div class="flex items-start gap-3">
        <div
          v-if="pilot?.cardImageUrl"
          class="w-16 h-24 shrink-0 rounded border border-gray-600 overflow-hidden"
        >
          <img
            :src="pilot.cardImageUrl"
            :alt="pilot.pilotName"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span
              v-if="pilot"
              class="xwing-ship text-2xl"
              :class="colorClasses[playerColor]"
            >
              {{ getShipIcon(pilot.shipType) }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-100 truncate">
                {{ pilot?.pilotName || "Unknown" }}
              </div>
              <div class="text-xs text-gray-400">PS {{ ship.pilotSkill }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3 text-xs mt-2">
            <span class="flex items-center gap-1 text-gray-300">
              <span class="xwing-icon text-red-500">{{ STAT_ICONS.hull }}</span>
              <span>{{ ship.hull }}</span>
            </span>
            <span class="flex items-center gap-1 text-gray-300">
              <span class="xwing-icon text-blue-500">{{
                STAT_ICONS.shield
              }}</span>
              <span>{{ ship.shields }}</span>
            </span>
          </div>
        </div>
        <svg
          class="w-5 h-5 text-gray-400 shrink-0 transition-transform"
          :class="isExpanded ? 'rotate-180' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <ShipTokenManager
      v-if="isExpanded"
      :ship="ship"
      @add-token="handleAddToken"
      @remove-token="handleRemoveToken"
    />
  </div>
</template>
