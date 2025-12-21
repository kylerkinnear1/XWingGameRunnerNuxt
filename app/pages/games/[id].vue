<script setup lang="ts">
import type { GameStateDto, ShipStateDto } from "#shared/game-state-dto";
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

// Map squads to ensure correct player association
const player1Squad = computed(() => {
  if (!gameData.value) return null;
  return squad1Response.squads.find(
    (s) => s.id === gameData.value!.player1SquadId
  );
});

const player2Squad = computed(() => {
  if (!gameData.value) return null;
  return squad2Response.squads.find(
    (s) => s.id === gameData.value!.player2SquadId
  );
});

const squads = computed(() => {
  const result: SquadReadDto[] = [];
  if (player1Squad.value) result.push(player1Squad.value);
  if (player2Squad.value) result.push(player2Squad.value);
  return result;
});

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

// Create ship lists directly from squads, just like the animation does
const createShipFromSquad = (
  shipDto: { id: string; pilotId: string; upgradeIds: string[] },
  playerId: string
): { ship: ShipStateDto; pilot: any } | null => {
  if (!cards.value) return null;
  const pilot = cards.value.pilots.find((p) => p.id === shipDto.pilotId);
  if (!pilot) return null;

  const shipState: ShipStateDto = {
    shipId: shipDto.id,
    playerId,
    pilotSkill: pilot.pilotSkill,
    hull: pilot.hull,
    shields: pilot.shields,
    attack: pilot.attack,
    agility: pilot.agility,
    tokens: [],
    faceUpDamage: [],
    faceDownDamage: 0,
    weapons: [],
    upgrades: shipDto.upgradeIds.map((id) => ({
      upgradeId: id,
      faceUp: false,
    })),
    isPlaced: false,
    isDestroyed: false,
    didBump: false,
    dialAssigned: null,
    isHalfPointsScored: false,
    hasActivated: false,
    collisions: [],
    attackTargetShipId: null,
    hasAttacked: false,
    maneuvers: pilot.maneuvers,
  };

  return { ship: shipState, pilot };
};

const player1Ships = computed(() => {
  if (!player1Squad.value || !gameData.value) return [];

  // If game has started, use ships from game state
  if (currentGameState.value && currentGameState.value.ships.length > 0) {
    return currentGameState.value.ships
      .filter((s) => s.playerId === gameData.value!.player1Id)
      .map((shipState) => {
        const shipDto = player1Squad.value!.ships.find(
          (s) => s.id === shipState.shipId
        );
        const pilot = cards.value?.pilots.find(
          (p) => p.id === shipDto?.pilotId
        );
        return { ship: shipState, pilot };
      });
  }

  // Before game starts, create from squad directly
  return player1Squad.value.ships
    .map((shipDto) => createShipFromSquad(shipDto, gameData.value!.player1Id))
    .filter((s): s is { ship: ShipStateDto; pilot: any } => s !== null);
});

const player2Ships = computed(() => {
  if (!player2Squad.value || !gameData.value) return [];

  // If game has started, use ships from game state
  if (currentGameState.value && currentGameState.value.ships.length > 0) {
    return currentGameState.value.ships
      .filter((s) => s.playerId === gameData.value!.player2Id)
      .map((shipState) => {
        const shipDto = player2Squad.value!.ships.find(
          (s) => s.id === shipState.shipId
        );
        const pilot = cards.value?.pilots.find(
          (p) => p.id === shipDto?.pilotId
        );
        return { ship: shipState, pilot };
      });
  }

  // Before game starts, create from squad directly
  return player2Squad.value.ships
    .map((shipDto) => createShipFromSquad(shipDto, gameData.value!.player2Id))
    .filter((s): s is { ship: ShipStateDto; pilot: any } => s !== null);
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
  // Reset expanded ship if it no longer exists after refresh
  if (expandedShipId.value) {
    const allShips = [...player1Ships.value, ...player2Ships.value];
    const shipExists = allShips.some(
      (s) => s.ship.shipId === expandedShipId.value
    );
    if (!shipExists) {
      expandedShipId.value = null;
    }
  }
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
        v-if="!gameStarted && player1Squad && player2Squad"
        :player1Squad="player1Squad"
        :player2Squad="player2Squad"
        @start="startGame"
      />

      <GameBoard
        v-else-if="gameStarted"
        :current-game-state="currentGameState"
      />
    </div>
  </div>
</template>
