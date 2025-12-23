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
  addToken: [shipId: string, tokenType: TokenType, targetShipId?: string | null, conditionId?: string | null];
  removeToken: [shipId: string, tokenType: TokenType];
  addFacedownDamage: [shipId: string];
  removeFacedownDamage: [shipId: string];
  assignCrit: [shipId: string, critCardId: string];
  removeCrit: [shipId: string, critCardId: string];
  flipCritFacedown: [shipId: string, critCardId: string];
  addStatModifier: [shipId: string, stat: "hull" | "shields" | "agility" | "attack" | "pilotSkill", amount: number];
  decreaseHull: [shipId: string];
  decreaseShields: [shipId: string];
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

function handleAddToken(shipId: string, tokenType: TokenType, targetShipId?: string | null, conditionId?: string | null) {
  emit("addToken", shipId, tokenType, targetShipId, conditionId);
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
    class="shrink-0 border-r border-gray-700 bg-gray-800 flex h-full relative"
    :class="expandedShipId ? 'overflow-visible' : 'overflow-hidden'"
  >
    <!-- Ships List -->
    <div
      class="flex flex-col transition-all h-full overflow-hidden"
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
          <GameShipCard
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
          <GameShipCard
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

    <!-- Token Drawer (floats over content to the right) -->
    <div
      v-if="expandedShipId"
      class="absolute left-full top-0 bottom-0 bg-gray-900 border-l border-gray-700 shadow-xl transition-all duration-300 overflow-hidden flex flex-col w-64 z-50"
    >
      <GameShipTokenManager
        v-if="expandedShip"
        :key="expandedShipId"
        :ship="expandedShip"
        :all-ships="[...player1Ships, ...player2Ships]"
        @add-token="handleAddToken"
        @remove-token="handleRemoveToken"
        @add-facedown-damage="(shipId) => emit('addFacedownDamage', shipId)"
        @remove-facedown-damage="(shipId) => emit('removeFacedownDamage', shipId)"
        @assign-crit="(shipId, critCardId) => emit('assignCrit', shipId, critCardId)"
        @remove-crit="(shipId, critCardId) => emit('removeCrit', shipId, critCardId)"
        @flip-crit-facedown="(shipId, critCardId) => emit('flipCritFacedown', shipId, critCardId)"
        @add-stat-modifier="(shipId, stat, amount) => emit('addStatModifier', shipId, stat, amount)"
        @decrease-hull="(shipId) => emit('decreaseHull', shipId)"
        @decrease-shields="(shipId) => emit('decreaseShields', shipId)"
        @close-token-manager="handleCloseTokenManager"
      />
    </div>
  </div>
</template>
