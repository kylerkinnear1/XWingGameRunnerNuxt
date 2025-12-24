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
  endCombat: [];
}>();

const selectedAttacker = ref<string | null>(null);
const selectedDefender = ref<string | null>(null);

// Ships that CAN attack (haven't attacked yet)
const player1ShipsCanAttack = computed(() => {
  return props.player1Ships
    .filter((s) => !s.ship.hasAttacked && !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

const player2ShipsCanAttack = computed(() => {
  return props.player2Ships
    .filter((s) => !s.ship.hasAttacked && !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

// Ships that HAVE already attacked (but can still defend)
const player1ShipsAlreadyAttacked = computed(() => {
  return props.player1Ships
    .filter((s) => s.ship.hasAttacked && !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

const player2ShipsAlreadyAttacked = computed(() => {
  return props.player2Ships
    .filter((s) => s.ship.hasAttacked && !s.ship.isDestroyed)
    .sort((a, b) => b.ship.pilotSkill - a.ship.pilotSkill);
});

const canDeclareAttack = computed(() => {
  return !!selectedAttacker.value && !!selectedDefender.value;
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

function endCombat() {
  emit("endCombat");
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative z-10">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Combat Phase</h2>
    </div>

    <!-- Ship Selection Grid -->
    <div class="flex-1 overflow-y-auto p-6">
      <div
        v-if="
          player1ShipsCanAttack.length === 0 &&
          player2ShipsCanAttack.length === 0
        "
        class="text-center py-12"
      >
        <p class="text-xl text-gray-400 mb-2">All ships have attacked!</p>
        <p class="text-sm text-gray-500">Ready to end combat phase.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <!-- Player 1 Ships -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-red-400 mb-4 sticky top-0 bg-gray-900 py-2 z-10">
            Player 1
          </h3>
          
          <!-- Ships that can still attack -->
          <div v-if="player1ShipsCanAttack.length === 0" class="text-center py-4">
            <p class="text-sm text-gray-500">No ships available to attack</p>
          </div>
          <template v-for="{ ship, pilot } in player1ShipsCanAttack" :key="ship.shipId">
            <div
              class="p-4 border-2 transition-all"
              :class="[
                selectedAttacker === ship.shipId
                  ? 'border-red-500 bg-red-900/20'
                  : selectedDefender === ship.shipId
                  ? 'border-teal-500 bg-teal-900/20'
                  : 'border-gray-600 bg-gray-800',
              ]"
            >
              <!-- Ship card display -->
              <div class="flex items-start gap-3 mb-3">
                <span class="xwing-ship text-red-400 text-3xl">
                  {{ getShipIcon(pilot?.shipType || '') }}
                </span>
                <div class="flex-1">
                  <h4 class="font-bold text-white">{{ pilot?.pilotName || 'Unknown' }}</h4>
                  <p class="text-xs text-gray-400">PS {{ ship.pilotSkill }}</p>
                  <div class="flex gap-2 text-xs mt-1">
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.attack" class="mr-1"></i>{{ ship.attack }}
                    </span>
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.agility" class="mr-1"></i>{{ ship.agility }}
                    </span>
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.hull" class="mr-1"></i>{{ ship.hull }}
                    </span>
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.shield" class="mr-1"></i>{{ ship.shields }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="flex gap-2">
                <button
                  @click="selectAttacker(ship.shipId)"
                  class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
                  class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
          </template>

          <!-- Already Attacked Section -->
          <div v-if="player1ShipsAlreadyAttacked.length > 0" class="mt-6 space-y-3">
            <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wide">
              Already Attacked
            </h4>
            <template v-for="{ ship, pilot } in player1ShipsAlreadyAttacked" :key="ship.shipId">
              <div
                class="p-4 border-2 transition-all opacity-75"
                :class="[
                  selectedAttacker === ship.shipId
                    ? 'border-red-500 bg-red-900/20'
                    : selectedDefender === ship.shipId
                    ? 'border-teal-500 bg-teal-900/20'
                    : 'border-gray-700 bg-gray-800/50',
                ]"
              >
                <!-- Ship card display -->
                <div class="flex items-start gap-3 mb-3">
                  <span class="xwing-ship text-red-400 text-3xl">
                    {{ getShipIcon(pilot?.shipType || '') }}
                  </span>
                  <div class="flex-1">
                    <h4 class="font-bold text-white">{{ pilot?.pilotName || 'Unknown' }}</h4>
                    <p class="text-xs text-gray-400">PS {{ ship.pilotSkill }}</p>
                    <div class="flex gap-2 text-xs mt-1">
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.attack" class="mr-1"></i>{{ ship.attack }}
                      </span>
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.agility" class="mr-1"></i>{{ ship.agility }}
                      </span>
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.hull" class="mr-1"></i>{{ ship.hull }}
                      </span>
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.shield" class="mr-1"></i>{{ ship.shields }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Action buttons -->
                <div class="flex gap-2">
                  <button
                    @click="selectAttacker(ship.shipId)"
                    class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
                    class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
            </template>
          </div>
        </div>

        <!-- Player 2 Ships (same structure) -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-gray-400 mb-4 sticky top-0 bg-gray-900 py-2 z-10">
            Player 2
          </h3>
          
          <!-- Ships that can still attack -->
          <div v-if="player2ShipsCanAttack.length === 0" class="text-center py-4">
            <p class="text-sm text-gray-500">No ships available to attack</p>
          </div>
          <template v-for="{ ship, pilot } in player2ShipsCanAttack" :key="ship.shipId">
            <div
              class="p-4 border-2 transition-all"
              :class="[
                selectedAttacker === ship.shipId
                  ? 'border-red-500 bg-red-900/20'
                  : selectedDefender === ship.shipId
                  ? 'border-teal-500 bg-teal-900/20'
                  : 'border-gray-600 bg-gray-800',
              ]"
            >
              <!-- Ship card display -->
              <div class="flex items-start gap-3 mb-3">
                <span class="xwing-ship text-gray-400 text-3xl">
                  {{ getShipIcon(pilot?.shipType || '') }}
                </span>
                <div class="flex-1">
                  <h4 class="font-bold text-white">{{ pilot?.pilotName || 'Unknown' }}</h4>
                  <p class="text-xs text-gray-400">PS {{ ship.pilotSkill }}</p>
                  <div class="flex gap-2 text-xs mt-1">
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.attack" class="mr-1"></i>{{ ship.attack }}
                    </span>
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.agility" class="mr-1"></i>{{ ship.agility }}
                    </span>
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.hull" class="mr-1"></i>{{ ship.hull }}
                    </span>
                    <span class="text-gray-400">
                      <i :class="STAT_ICONS.shield" class="mr-1"></i>{{ ship.shields }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="flex gap-2">
                <button
                  @click="selectAttacker(ship.shipId)"
                  class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
                  class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
          </template>

          <!-- Already Attacked Section -->
          <div v-if="player2ShipsAlreadyAttacked.length > 0" class="mt-6 space-y-3">
            <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wide">
              Already Attacked
            </h4>
            <template v-for="{ ship, pilot } in player2ShipsAlreadyAttacked" :key="ship.shipId">
              <div
                class="p-4 border-2 transition-all opacity-75"
                :class="[
                  selectedAttacker === ship.shipId
                    ? 'border-red-500 bg-red-900/20'
                    : selectedDefender === ship.shipId
                    ? 'border-teal-500 bg-teal-900/20'
                    : 'border-gray-700 bg-gray-800/50',
                ]"
              >
                <!-- Ship card display -->
                <div class="flex items-start gap-3 mb-3">
                  <span class="xwing-ship text-gray-400 text-3xl">
                    {{ getShipIcon(pilot?.shipType || '') }}
                  </span>
                  <div class="flex-1">
                    <h4 class="font-bold text-white">{{ pilot?.pilotName || 'Unknown' }}</h4>
                    <p class="text-xs text-gray-400">PS {{ ship.pilotSkill }}</p>
                    <div class="flex gap-2 text-xs mt-1">
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.attack" class="mr-1"></i>{{ ship.attack }}
                      </span>
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.agility" class="mr-1"></i>{{ ship.agility }}
                      </span>
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.hull" class="mr-1"></i>{{ ship.hull }}
                      </span>
                      <span class="text-gray-400">
                        <i :class="STAT_ICONS.shield" class="mr-1"></i>{{ ship.shields }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Action buttons -->
                <div class="flex gap-2">
                  <button
                    @click="selectAttacker(ship.shipId)"
                    class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
                    class="flex-1 px-4 py-2 text-sm font-bold text-white border-b-2 transition-all uppercase tracking-wide"
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
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-6 border-t border-gray-700 bg-gray-800">
      <div class="max-w-4xl mx-auto flex items-center justify-center gap-4">
        <AppButton
          variant="primary"
          size="lg"
          :disabled="!canDeclareAttack"
          @click="declareAttack"
        >
          Declare Attack
        </AppButton>
        <AppButton
          variant="accent"
          size="lg"
          @click="endCombat"
        >
          End Combat
        </AppButton>
      </div>
    </div>
  </div>
</template>
