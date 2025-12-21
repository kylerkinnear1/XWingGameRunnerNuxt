<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import type { Maneuver } from "#shared/enums";
import { ManeuverDifficulty, Bearing } from "#shared/enums";
import { getShipIcon } from "#shared/xwing-icons";

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
}>();

// Track which player is currently selecting
const currentPlayerId = ref<string>(
  props.playerWithInitiative || props.player1Id
);

// Track selected dials for all ships
const selectedDials = ref<Record<string, Maneuver>>({});

// Get ships for current player
const currentPlayerShips = computed(() => {
  return currentPlayerId.value === props.player1Id
    ? props.player1Ships
    : props.player2Ships;
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
const allDialsAssigned = computed(() => {
  return currentPlayerShips.value.every(
    (s) => !!selectedDials.value[s.ship.shipId]
  );
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

  const bearingSymbols: Record<Bearing, string> = {
    [Bearing.Straight]: "8",
    [Bearing.BankLeft]: "7",
    [Bearing.BankRight]: "9",
    [Bearing.TurnLeft]: "4",
    [Bearing.TurnRight]: "6",
    [Bearing.KTurn]: "K",
    [Bearing.SloopLeft]: "1",
    [Bearing.SloopRight]: "3",
    [Bearing.TallonRollLeft]: ":",
    [Bearing.TallonRollRight]: ";",
    [Bearing.Stationary]: "5",
    [Bearing.Reverse]: "S",
  };

  return {
    bearing: bearingSymbols[maneuver.bearing] || "?",
    speed: maneuver.speed,
    difficulty: maneuver.difficulty,
    color: colorMap[maneuver.difficulty],
  };
}

function selectDial(shipId: string, maneuver: Maneuver) {
  selectedDials.value[shipId] = maneuver;
}

function confirmDials() {
  if (isInitiativePlayer.value) {
    // Switch to second player
    currentPlayerId.value = otherPlayerId.value;
  } else {
    // Both players done - emit complete event
    emit("completePlanning", { ...selectedDials.value });
  }
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
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Planning Phase</h2>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Current Player:</span>
          <span
            class="px-3 py-1 rounded text-sm font-semibold"
            :class="
              currentPlayerId === player1Id
                ? 'bg-red-600 text-white'
                : 'bg-gray-600 text-white'
            "
          >
            {{ currentPlayerId === player1Id ? "Player 1" : "Player 2" }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Ships Remaining:</span>
          <span class="text-sm font-semibold text-teal-400">
            {{
              currentPlayerShips.filter((s) => !selectedDials[s.ship.shipId])
                .length
            }}
            / {{ currentPlayerShips.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Ship List -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-6xl mx-auto space-y-4">
        <div
          v-for="{ ship, pilot } in currentPlayerShips"
          :key="ship.shipId"
          class="border-2 transition-all"
          :class="
            selectedDials[ship.shipId]
              ? 'border-teal-500 bg-gray-800'
              : 'border-gray-700 bg-gray-800'
          "
        >
          <!-- Ship Header -->
          <div class="p-4 border-b border-gray-700 bg-gray-900">
            <div class="flex items-center gap-4">
              <!-- Pilot Skill Badge - Orange like the cards -->
              <div
                class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-orange-600 text-white"
              >
                {{ ship.pilotSkill }}
              </div>

              <!-- Ship Icon -->
              <span
                v-if="pilot"
                class="xwing-ship text-4xl shrink-0"
                :class="
                  currentPlayerId === player1Id
                    ? 'text-red-400'
                    : 'text-gray-400'
                "
              >
                {{ getShipIcon(pilot.shipType) }}
              </span>

              <!-- Ship Details - Just name, no redundant stats -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-100">
                  {{ pilot?.pilotName || "Unknown" }}
                </h3>
              </div>

              <!-- Selected Dial Display -->
              <div
                v-if="selectedDials[ship.shipId]"
                class="shrink-0 flex flex-col items-center gap-1 px-6 py-3 bg-teal-900/50 border border-teal-600 rounded"
              >
                <span class="text-xs text-gray-400 uppercase tracking-wide"
                  >Selected</span
                >
                <!-- Dial Arrow -->
                <span
                  class="xwing-icon text-5xl"
                  :class="getManeuverDisplay(selectedDials[ship.shipId]!).color"
                >
                  {{ getManeuverDisplay(selectedDials[ship.shipId]!).bearing }}
                </span>
                <!-- Speed underneath -->
                <span
                  class="text-3xl font-bold"
                  :class="getManeuverDisplay(selectedDials[ship.shipId]!).color"
                >
                  {{ getManeuverDisplay(selectedDials[ship.shipId]!).speed }}
                </span>
              </div>
            </div>
          </div>

          <!-- Maneuver Selection -->
          <div class="p-4">
            <div class="space-y-3">
              <div
                v-for="[speed, maneuvers] in groupManeuversBySpeed(
                  ship.maneuvers
                )"
                :key="speed"
                class="flex items-start gap-3"
              >
                <!-- Speed Label -->
                <div
                  class="shrink-0 w-8 h-8 rounded flex items-center justify-center text-lg font-bold bg-gray-700 text-gray-300"
                >
                  {{ speed }}
                </div>

                <!-- Maneuver Options - Show as dials with arrow on top, speed on bottom -->
                <div class="flex-1 flex flex-wrap gap-2">
                  <button
                    v-for="(maneuver, index) in maneuvers"
                    :key="index"
                    @click="selectDial(ship.shipId, maneuver)"
                    class="flex flex-col items-center gap-1 px-3 py-2 border-2 transition-all hover:scale-105"
                    :class="[
                      selectedDials[ship.shipId] === maneuver
                        ? 'border-teal-500 bg-teal-900/50'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500',
                    ]"
                  >
                    <!-- Dial Arrow -->
                    <span
                      class="xwing-icon text-4xl"
                      :class="getManeuverDisplay(maneuver).color"
                    >
                      {{ getManeuverDisplay(maneuver).bearing }}
                    </span>
                    <!-- Speed underneath -->
                    <span
                      class="text-2xl font-bold"
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
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="text-sm text-gray-400">
          <span v-if="!allDialsAssigned">
            Assign dials to all ships to continue
          </span>
          <span
            v-else-if="isInitiativePlayer"
            class="text-teal-400 font-semibold"
          >
            Ready to pass to Player 2
          </span>
          <span v-else class="text-teal-400 font-semibold">
            Ready to begin activation
          </span>
        </div>
        <button
          @click="confirmDials"
          :disabled="!allDialsAssigned"
          class="px-8 py-3 text-sm font-bold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
        >
          {{
            isInitiativePlayer ? "Pass Device to Player 2" : "Begin Activation"
          }}
        </button>
      </div>
    </div>
  </div>
</template>
