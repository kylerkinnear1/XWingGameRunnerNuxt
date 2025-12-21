<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import type { TokenType } from "#shared/enums";

interface ShipWithPilot {
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
}

const props = defineProps<{
  player1Ships: ShipWithPilot[];
  player2Ships: ShipWithPilot[];
  expandedShipId: string | null;
}>();

const emit = defineEmits<{
  toggleExpansion: [shipId: string];
  addToken: [shipId: string, tokenType: TokenType];
  removeToken: [shipId: string, tokenType: TokenType];
}>();

const isOpen = ref(true);

const expandedShip = computed(() => {
  if (!props.expandedShipId) return null;
  const allShips = [...props.player1Ships, ...props.player2Ships];
  return (
    allShips.find((s) => s.ship.shipId === props.expandedShipId)?.ship ?? null
  );
});

function handleToggleExpansion(shipId: string) {
  emit("toggleExpansion", shipId);
}

function handleAddToken(shipId: string, tokenType: TokenType) {
  emit("addToken", shipId, tokenType);
}

function handleRemoveToken(shipId: string, tokenType: TokenType) {
  emit("removeToken", shipId, tokenType);
}

function handleCloseTokenManager() {
  if (props.expandedShipId) {
    emit("toggleExpansion", props.expandedShipId);
  }
}
</script>

<template>
  <div
    class="shrink-0 border-r border-gray-700 bg-gray-800 overflow-hidden flex h-full"
  >
    <!-- Ships List -->
    <div
      class="flex flex-col transition-all h-full"
      :class="isOpen ? 'w-96' : 'w-12'"
    >
      <div
        class="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between"
      >
        <h2
          v-if="isOpen"
          class="text-sm font-bold uppercase tracking-wide text-gray-400"
        >
          Ships
        </h2>
        <button
          @click="isOpen = !isOpen"
          class="p-2 hover:bg-gray-700 transition-colors rounded text-gray-400 hover:text-gray-200"
        >
          <svg
            v-if="isOpen"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
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
        </button>
      </div>

      <div v-if="isOpen" class="flex-1 overflow-y-auto">
        <!-- Player 1 Ships -->
        <div v-if="player1Ships.length > 0" class="p-2">
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
            Player 1
          </div>
          <ShipCard
            v-for="{ ship, pilot } in player1Ships"
            :key="ship.shipId"
            :ship="ship"
            :pilot="pilot"
            :is-expanded="expandedShipId === ship.shipId"
            player-color="red"
            @toggle-expansion="handleToggleExpansion"
          />
        </div>

        <!-- Player 2 Ships -->
        <div
          v-if="player2Ships.length > 0"
          class="p-2 border-t border-gray-700"
        >
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
            Player 2
          </div>
          <ShipCard
            v-for="{ ship, pilot } in player2Ships"
            :key="ship.shipId"
            :ship="ship"
            :pilot="pilot"
            :is-expanded="expandedShipId === ship.shipId"
            player-color="gray"
            @toggle-expansion="handleToggleExpansion"
          />
        </div>
      </div>
    </div>

    <!-- Token Drawer (slides from right of ship list) -->
    <div
      class="bg-gray-900 border-l border-gray-700 shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
      :class="expandedShipId ? 'w-64' : 'w-0'"
    >
      <ShipTokenManager
        v-if="expandedShip && expandedShipId"
        :ship="expandedShip"
        @add-token="handleAddToken"
        @remove-token="handleRemoveToken"
        @close-token-manager="handleCloseTokenManager"
      />
    </div>
  </div>
</template>
