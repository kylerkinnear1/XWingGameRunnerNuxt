<script setup lang="ts">
import type { GameStateDto } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import type { TokenType } from "#shared/enums";
import { calculateGameState } from "#shared/game-state/calculator";

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
      ship: shipState,
      pilot,
    };
  });
});

const player1Ships = computed(() => {
  if (!gameData.value) return [];
  return shipsWithDetails.value.filter(
    (s) => s.ship.playerId === gameData.value?.player1Id
  );
});

const player2Ships = computed(() => {
  if (!gameData.value) return [];
  return shipsWithDetails.value.filter(
    (s) => s.ship.playerId === gameData.value?.player2Id
  );
});

function selectStep(index: number) {
  selectedStepIndex.value = index;
}

function toggleShipExpansion(shipId: string) {
  expandedShipId.value = expandedShipId.value === shipId ? null : shipId;
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
    <!-- Game Steps List -->
    <GameStepsList
      :steps="gameData?.steps || []"
      :selected-index="selectedStepIndex"
      :loading="gamePending"
      :error="!!gameError"
      @select-step="selectStep"
    />

    <!-- Ships Drawer -->
    <ShipsDrawer
      :player1-ships="player1Ships"
      :player2-ships="player2Ships"
      :expanded-ship-id="expandedShipId"
      @toggle-expansion="toggleShipExpansion"
      @add-token="addToken"
      @remove-token="removeToken"
    />

    <!-- Main Game Area -->
    <div class="flex-1 overflow-hidden">
      <GameStartAnimation
        v-if="!gameStarted && squads.length >= 2 && squads[0] && squads[1]"
        :player1Squad="squads[0]"
        :player2Squad="squads[1]"
        @start="startGame"
      />

      <GameBoard
        v-else-if="gameStarted"
        :current-game-state="currentGameState"
      />
    </div>
  </div>
</template>
