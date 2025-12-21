<script setup lang="ts">
import type { GameStateDto, ShipStateDto } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import { calculateGameState } from "#shared/game-state/calculator";
import {
  FACTION_ICONS,
  getShipIcon,
  TOKEN_ICONS,
  STAT_ICONS,
} from "#shared/xwing-icons";
import { TokenType } from "#shared/enums";

const route = useRoute();
const gameId = route.params.id as string;

const { cards, loadCards } = useCards();

await loadCards();

const {
  data: gameData,
  pending: gamePending,
  error: gameError,
  refresh: refreshGameData,
} = await useFetch<GameStateDto>(`/api/games/${gameId}`);

const squad1Promise = $fetch<{ squads: SquadReadDto[] }>(
  `/api/squads/${gameData.value?.player1SquadId}`
);
const squad2Promise = $fetch<{ squads: SquadReadDto[] }>(
  `/api/squads/${gameData.value?.player2SquadId}`
);

const [squad1Response, squad2Response] = await Promise.all([
  squad1Promise,
  squad2Promise,
]);

const squads = ref<SquadReadDto[]>(
  [squad1Response.squads[0], squad2Response.squads[0]].filter(
    (s): s is SquadReadDto => s !== undefined
  )
);

const selectedStepIndex = ref(0);
const shipsDrawerOpen = ref(true);
const expandedShipId = ref<string | null>(null);

const gameStarted = computed(() => {
  return (
    gameData.value?.steps.some((step) => step.type === "game_start") ?? false
  );
});

const currentGameState = computed(() => {
  if (!gameData.value || !cards.value || !squads.value) return null;

  const partialGameState: GameStateDto = {
    ...gameData.value,
    steps: gameData.value.steps.slice(0, selectedStepIndex.value + 1),
  };

  return calculateGameState(partialGameState, squads.value, {
    pilots: [...cards.value.pilots],
    upgrades: [...cards.value.upgrades],
  });
});

const shipsWithDetails = computed(() => {
  if (
    !currentGameState.value ||
    !cards.value ||
    !squads.value ||
    !gameData.value
  )
    return [];

  return currentGameState.value.ships.map((shipState) => {
    const squad = squads.value.find(
      (s) =>
        s.id === gameData.value!.player1SquadId ||
        s.id === gameData.value!.player2SquadId
    );
    const shipDto = squad?.ships.find((s) => s.id === shipState.shipId);
    const pilot = cards.value?.pilots.find((p) => p.id === shipDto?.pilotId);

    return {
      ...shipState,
      pilot,
      squad,
    };
  });
});

const player1Ships = computed(() => {
  if (!gameData.value) return [];
  return shipsWithDetails.value.filter(
    (s) => s.playerId === gameData.value?.player1Id
  );
});

const player2Ships = computed(() => {
  if (!gameData.value) return [];
  return shipsWithDetails.value.filter(
    (s) => s.playerId === gameData.value?.player2Id
  );
});

function selectStep(index: number) {
  selectedStepIndex.value = index;
}

function toggleShipExpansion(shipId: string) {
  expandedShipId.value = expandedShipId.value === shipId ? null : shipId;
}

function getTokenIcon(tokenType: TokenType): string {
  const iconMap: Record<string, string> = {
    [TokenType.Focus]: TOKEN_ICONS.focus,
    [TokenType.Evade]: TOKEN_ICONS.evade,
    [TokenType.Stress]: TOKEN_ICONS.stress,
    [TokenType.Ion]: TOKEN_ICONS.ion,
    [TokenType.TargetLock]: TOKEN_ICONS.targetLock,
    [TokenType.Reinforce]: TOKEN_ICONS.reinforce,
    [TokenType.Cloak]: TOKEN_ICONS.cloak,
    [TokenType.Jam]: TOKEN_ICONS.jam,
    [TokenType.Calculate]: TOKEN_ICONS.calculate,
    [TokenType.Charge]: TOKEN_ICONS.charge,
    [TokenType.Force]: TOKEN_ICONS.force,
    [TokenType.Disarm]: TOKEN_ICONS.disarm,
    [TokenType.Tractor]: TOKEN_ICONS.tractor,
    [TokenType.Strain]: TOKEN_ICONS.strain,
    [TokenType.Deplete]: TOKEN_ICONS.deplete,
    [TokenType.Shield]: TOKEN_ICONS.shield,
  };
  return iconMap[tokenType] || "?";
}

function getTokenCount(ship: ShipStateDto, tokenType: TokenType): number {
  return ship.tokens.filter((t) => t.tokenType === tokenType).length;
}

async function addToken(shipId: string, tokenType: TokenType) {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "assign_token",
      sourceShipId: shipId,
      tokenType,
      conditionId: null,
      reinforceDirection: null,
      targetShipId: null,
      timestamp: new Date(),
    },
  });
  await refresh();
}

async function removeToken(shipId: string, tokenType: TokenType) {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "spend_token",
      shipId,
      tokenType,
      timestamp: new Date(),
    },
  });
  await refresh();
}

async function startGame() {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "game_start",
      timestamp: new Date(),
    },
  });
  await refresh();
}

async function refresh() {
  await refreshGameData();
}
</script>

<template>
  <div class="h-full flex bg-gray-900 overflow-hidden">
    <!-- Left Sidebar - Game Steps Only -->
    <div
      class="w-64 shrink-0 border-r border-gray-700 bg-gray-800 overflow-y-auto"
    >
      <div class="p-4 border-b border-gray-700 bg-gray-900">
        <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">
          Game Steps
        </h2>
        <p class="text-xs text-gray-500 mt-1">Click to replay to step</p>
      </div>

      <div v-if="gamePending" class="p-4 text-gray-400 text-sm">
        Loading game...
      </div>

      <div v-else-if="gameError" class="p-4 text-red-400 text-sm">
        Failed to load game
      </div>

      <div v-else-if="gameData" class="p-2">
        <div
          v-for="(step, index) in gameData.steps"
          :key="index"
          @click="selectStep(index)"
          class="p-3 mb-1 border cursor-pointer transition-all"
          :class="[
            selectedStepIndex === index
              ? 'border-teal-500 bg-gray-700 border-l-4'
              : 'border-gray-700 bg-gray-800 hover:bg-gray-750 border-l-2',
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-semibold text-gray-100 truncate">
                {{ step.type.replace(/_/g, " ").toUpperCase() }}
              </div>
              <div class="text-xs text-gray-500">Step {{ index + 1 }}</div>
            </div>
            <div class="text-xs text-gray-600">
              {{ new Date(step.timestamp).toLocaleTimeString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ships Drawer -->
    <div
      class="shrink-0 border-r border-gray-700 bg-gray-800 overflow-hidden flex flex-col transition-all"
      :class="shipsDrawerOpen ? 'w-96' : 'w-12'"
    >
      <div
        class="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between"
      >
        <h2
          v-if="shipsDrawerOpen"
          class="text-sm font-bold uppercase tracking-wide text-gray-400"
        >
          Ships
        </h2>
        <button
          @click="shipsDrawerOpen = !shipsDrawerOpen"
          class="p-2 hover:bg-gray-700 transition-colors rounded text-gray-400 hover:text-gray-200"
        >
          <svg
            v-if="shipsDrawerOpen"
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

      <div v-if="shipsDrawerOpen" class="flex-1 overflow-y-auto">
        <!-- Player 1 Ships -->
        <div v-if="player1Ships.length > 0" class="p-2">
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
            Player 1
          </div>
          <div
            v-for="ship in player1Ships"
            :key="ship.shipId"
            class="mb-2 border border-gray-700 bg-gray-800 hover:border-teal-500 transition-all"
          >
            <div
              @click="toggleShipExpansion(ship.shipId)"
              class="p-3 cursor-pointer"
            >
              <div class="flex items-start gap-3">
                <div
                  v-if="ship.pilot?.cardImageUrl"
                  class="w-16 h-24 shrink-0 rounded border border-gray-600 overflow-hidden"
                >
                  <img
                    :src="ship.pilot.cardImageUrl"
                    :alt="ship.pilot.pilotName"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      v-if="ship.pilot"
                      class="xwing-ship text-2xl text-red-400"
                    >
                      {{ getShipIcon(ship.pilot.shipType) }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-gray-100 truncate">
                        {{ ship.pilot?.pilotName || "Unknown" }}
                      </div>
                      <div class="text-xs text-gray-400">
                        PS {{ ship.pilotSkill }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-xs mt-2">
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-red-500">{{
                        STAT_ICONS.hull
                      }}</span>
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
                  :class="expandedShipId === ship.shipId ? 'rotate-180' : ''"
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

            <!-- Expanded Token Section -->
            <div
              v-if="expandedShipId === ship.shipId"
              class="border-t border-gray-700 p-3 bg-gray-900"
            >
              <div class="text-xs font-semibold text-gray-400 mb-2">Tokens</div>
              <div class="space-y-2">
                <div
                  v-for="tokenType in [
                    TokenType.Focus,
                    TokenType.Evade,
                    TokenType.Stress,
                    TokenType.Ion,
                    TokenType.TargetLock,
                    TokenType.Reinforce,
                    TokenType.Cloak,
                    TokenType.Jam,
                    TokenType.Calculate,
                    TokenType.Charge,
                    TokenType.Force,
                    TokenType.Disarm,
                    TokenType.Tractor,
                    TokenType.Strain,
                    TokenType.Deplete,
                    TokenType.Shield,
                  ]"
                  :key="tokenType"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <span class="xwing-icon text-lg text-gray-300">{{
                      getTokenIcon(tokenType)
                    }}</span>
                    <span class="text-xs text-gray-400">{{
                      tokenType
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                    }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-300 w-6 text-center">{{
                      getTokenCount(ship, tokenType)
                    }}</span>
                    <button
                      @click.stop="addToken(ship.shipId, tokenType)"
                      class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded transition-colors"
                    >
                      +
                    </button>
                    <button
                      @click.stop="removeToken(ship.shipId, tokenType)"
                      :disabled="getTokenCount(ship, tokenType) === 0"
                      class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded transition-colors"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Player 2 Ships -->
        <div
          v-if="player2Ships.length > 0"
          class="p-2 border-t border-gray-700"
        >
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2 px-2">
            Player 2
          </div>
          <div
            v-for="ship in player2Ships"
            :key="ship.shipId"
            class="mb-2 border border-gray-700 bg-gray-800 hover:border-teal-500 transition-all"
          >
            <div
              @click="toggleShipExpansion(ship.shipId)"
              class="p-3 cursor-pointer"
            >
              <div class="flex items-start gap-3">
                <div
                  v-if="ship.pilot?.cardImageUrl"
                  class="w-16 h-24 shrink-0 rounded border border-gray-600 overflow-hidden"
                >
                  <img
                    :src="ship.pilot.cardImageUrl"
                    :alt="ship.pilot.pilotName"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      v-if="ship.pilot"
                      class="xwing-ship text-2xl text-gray-400"
                    >
                      {{ getShipIcon(ship.pilot.shipType) }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-gray-100 truncate">
                        {{ ship.pilot?.pilotName || "Unknown" }}
                      </div>
                      <div class="text-xs text-gray-400">
                        PS {{ ship.pilotSkill }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-xs mt-2">
                    <span class="flex items-center gap-1 text-gray-300">
                      <span class="xwing-icon text-red-500">{{
                        STAT_ICONS.hull
                      }}</span>
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
                  :class="expandedShipId === ship.shipId ? 'rotate-180' : ''"
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

            <!-- Expanded Token Section -->
            <div
              v-if="expandedShipId === ship.shipId"
              class="border-t border-gray-700 p-3 bg-gray-900"
            >
              <div class="text-xs font-semibold text-gray-400 mb-2">Tokens</div>
              <div class="space-y-2">
                <div
                  v-for="tokenType in [
                    TokenType.Focus,
                    TokenType.Evade,
                    TokenType.Stress,
                    TokenType.Ion,
                    TokenType.TargetLock,
                    TokenType.Reinforce,
                    TokenType.Cloak,
                    TokenType.Jam,
                    TokenType.Calculate,
                    TokenType.Charge,
                    TokenType.Force,
                    TokenType.Disarm,
                    TokenType.Tractor,
                    TokenType.Strain,
                    TokenType.Deplete,
                    TokenType.Shield,
                  ]"
                  :key="tokenType"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <span class="xwing-icon text-lg text-gray-300">{{
                      getTokenIcon(tokenType)
                    }}</span>
                    <span class="text-xs text-gray-400">{{
                      tokenType
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                    }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-300 w-6 text-center">{{
                      getTokenCount(ship, tokenType)
                    }}</span>
                    <button
                      @click.stop="addToken(ship.shipId, tokenType)"
                      class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded transition-colors"
                    >
                      +
                    </button>
                    <button
                      @click.stop="removeToken(ship.shipId, tokenType)"
                      :disabled="getTokenCount(ship, tokenType) === 0"
                      class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded transition-colors"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="flex-1 overflow-hidden">
      <GameStartAnimation
        v-if="!gameStarted && squads.length >= 2 && squads[0] && squads[1]"
        :player1Squad="squads[0]"
        :player2Squad="squads[1]"
        @start="startGame"
      />

      <div
        v-else-if="gameStarted && currentGameState"
        class="h-full overflow-y-auto"
      >
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-100">Game In Progress</h2>
          <p class="text-gray-400 mt-2">
            Current Phase: {{ currentGameState.currentPhase }}
          </p>
          <p class="text-gray-400">Turn: {{ currentGameState.totalTurns }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
