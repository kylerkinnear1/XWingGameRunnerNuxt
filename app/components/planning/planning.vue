<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import type { Maneuver } from "#shared/enums";
import { ManeuverDifficulty, Bearing } from "#shared/enums";
import { getShipIcon, getBearingIcon } from "#shared/xwing-icons";

interface ShipWithPilot {
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
}

const props = defineProps<{
  player1Ships: ShipWithPilot[];
  player2Ships: ShipWithPilot[];
  player1Id: string;
  player2Id: string;
  playerWithInitiative: string | null;
}>();

const emit = defineEmits<{
  completePlanning: [dials: Record<string, Maneuver>];
  beginActivation: [];
}>();

// Track which player is currently selecting
const currentPlayerId = ref<string>(
  props.playerWithInitiative || props.player1Id
);

// Track selected dials for all ships - initialize from ship.dialAssigned if already set
const selectedDials = ref<Record<string, Maneuver>>({});

// Initialize selectedDials from ship.dialAssigned when component loads or props change
watch(
  () => [...props.player1Ships, ...props.player2Ships],
  (ships) => {
    ships.forEach(({ ship }) => {
      if (ship.dialAssigned) {
        selectedDials.value[ship.shipId] = ship.dialAssigned;
      }
    });
  },
  { immediate: true, deep: true }
);

// Get all ships (excluding destroyed)
const allShips = computed(() =>
  [...props.player1Ships, ...props.player2Ships].filter(
    (s) => !s.ship.isDestroyed
  )
);

// Get ships for current player (excluding destroyed)
const currentPlayerShips = computed(() => {
  const ships =
    currentPlayerId.value === props.player1Id
      ? props.player1Ships
      : props.player2Ships;
  return ships.filter((s) => !s.ship.isDestroyed);
});

const otherPlayerId = computed(() => {
  return currentPlayerId.value === props.player1Id
    ? props.player2Id
    : props.player1Id;
});

const isInitiativePlayer = computed(() => {
  return currentPlayerId.value === props.playerWithInitiative;
});

// Check if all current player's ships have dials assigned
const allCurrentPlayerDialsAssigned = computed(() => {
  return currentPlayerShips.value.every(
    (s) => !!selectedDials.value[s.ship.shipId]
  );
});

// Check if all ships (both players) have dials assigned
const allDialsAssigned = computed(() => {
  return allShips.value.every((s) => !!selectedDials.value[s.ship.shipId]);
});

// Always show only the current player's ships to keep information secret
const shipsToShow = computed(() => {
  return currentPlayerShips.value;
});

// Get maneuver display info
function getManeuverDisplay(maneuver: Maneuver): {
  bearing: string;
  speed: number;
  difficulty: ManeuverDifficulty;
  color: string;
} {
  const colorMap = {
    [ManeuverDifficulty.Green]: "text-green-500",
    [ManeuverDifficulty.White]: "text-gray-100",
    [ManeuverDifficulty.Red]: "text-red-500",
  };

  return {
    bearing: getBearingIcon(maneuver.bearing),
    speed: maneuver.speed,
    difficulty: maneuver.difficulty,
    color: colorMap[maneuver.difficulty],
  };
}

function selectDial(shipId: string, maneuver: Maneuver) {
  selectedDials.value[shipId] = maneuver;
}

function confirmDials() {
  console.log("confirmDials called", {
    isInitiativePlayer: isInitiativePlayer.value,
    currentPlayerId: currentPlayerId.value,
    allDialsAssigned: allDialsAssigned.value,
    selectedDialsCount: Object.keys(selectedDials.value).length,
  });
  
  if (isInitiativePlayer.value) {
    // Switch to second player
    currentPlayerId.value = otherPlayerId.value;
  } else {
    // Both players done - emit complete event with dials
    console.log("Emitting completePlanning event", selectedDials.value);
    emit("completePlanning", { ...selectedDials.value });
  }
}

function beginActivation() {
  emit("beginActivation");
}

// Group maneuvers by speed for display
function groupManeuversBySpeed(
  maneuvers: readonly Maneuver[]
): Map<number, Maneuver[]> {
  const grouped = new Map<number, Maneuver[]>();
  maneuvers.forEach((m) => {
    if (!grouped.has(m.speed)) {
      grouped.set(m.speed, []);
    }
    grouped.get(m.speed)!.push(m);
  });
  return grouped;
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative z-10">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Planning Phase</h2>
    </div>

    <!-- Ship List -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-6xl mx-auto space-y-4">
        <div
          v-for="{ ship, pilot } in shipsToShow"
          :key="ship.shipId"
          class="border-2 transition-all"
          :class="
            selectedDials[ship.shipId]
              ? 'border-teal-500 bg-gray-800'
              : 'border-gray-700 bg-gray-800'
          "
        >
          <!-- Ship Header -->
          <div class="p-3 border-b border-gray-700 bg-gray-900">
            <div class="flex items-center gap-3">
              <!-- Pilot Skill Badge - Orange like the cards -->
              <div
                class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold text-orange-600"
              >
                {{ ship.pilotSkill }}
              </div>

              <!-- Ship Icon -->
              <span
                v-if="pilot"
                class="xwing-ship text-3xl shrink-0"
                :class="
                  ship.playerId === player1Id ? 'text-red-400' : 'text-gray-400'
                "
              >
                {{ getShipIcon(pilot.shipType) }}
              </span>

              <!-- Ship Details - Just name, no redundant stats -->
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-100">
                  {{ pilot?.pilotName || "Unknown" }}
                </h3>
              </div>

              <!-- Selected Dial Display - Compact version -->
              <div
                v-if="selectedDials[ship.shipId]"
                class="shrink-0 flex items-center gap-1 px-3 py-1 bg-teal-900/30 border border-teal-700 rounded"
              >
                <span
                  class="xwing-icon text-2xl"
                  :class="getManeuverDisplay(selectedDials[ship.shipId]!).color"
                >
                  {{ getManeuverDisplay(selectedDials[ship.shipId]!).bearing }}
                </span>
                <span
                  class="text-xl font-bold"
                  :class="getManeuverDisplay(selectedDials[ship.shipId]!).color"
                >
                  {{ getManeuverDisplay(selectedDials[ship.shipId]!).speed }}
                </span>
              </div>
            </div>
          </div>

          <!-- Maneuver Selection -->
          <div class="p-3">
            <div class="space-y-2">
              <div
                v-for="[speed, maneuvers] in groupManeuversBySpeed(
                  ship.maneuvers
                )"
                :key="speed"
                class="flex items-center gap-2"
              >
                <!-- Left-aligned container with centered dials inside -->
                <div class="flex-1 flex flex-wrap gap-1.5 justify-center">
                  <button
                    v-for="(maneuver, index) in maneuvers"
                    :key="index"
                    @click="selectDial(ship.shipId, maneuver)"
                    class="flex flex-col items-center justify-center gap-0 px-2 py-1.5 border-2 transition-all hover:scale-105 min-w-[48px]"
                    :class="[
                      selectedDials[ship.shipId] === maneuver
                        ? 'border-teal-500 bg-teal-900/50'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500',
                    ]"
                  >
                    <!-- Dial Arrow -->
                    <span
                      class="xwing-icon text-2xl leading-none"
                      :class="getManeuverDisplay(maneuver).color"
                    >
                      {{ getManeuverDisplay(maneuver).bearing }}
                    </span>
                    <!-- Speed underneath -->
                    <span
                      class="text-lg font-bold leading-none"
                      :class="getManeuverDisplay(maneuver).color"
                    >
                      {{ getManeuverDisplay(maneuver).speed }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-6 border-t border-gray-700 bg-gray-800">
      <div class="max-w-6xl mx-auto flex items-center justify-center">
        <AppButton
          v-if="allDialsAssigned && !isInitiativePlayer"
          variant="primary"
          size="lg"
          @click="confirmDials"
          class="uppercase tracking-wide"
        >
          Complete Planning
        </AppButton>
        <AppButton
          v-else-if="allDialsAssigned"
          variant="primary"
          size="lg"
          @click="beginActivation"
          class="uppercase tracking-wide"
        >
          Begin Activation
        </AppButton>
        <AppButton
          v-else
          variant="primary"
          size="lg"
          :disabled="!allCurrentPlayerDialsAssigned"
          @click="confirmDials"
          class="uppercase tracking-wide"
        >
          {{
            isInitiativePlayer ? "Pass Device to Player 2" : "Complete Planning"
          }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
