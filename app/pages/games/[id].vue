<script setup lang="ts">
import type { GameStateDto, ShipStateDto } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import type { TokenType, Maneuver, ActionType } from "#shared/enums";
import { CollisionType, GamePhase } from "#shared/enums";
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

const initiativeSelected = computed(() => {
  return (
    gameData.value?.steps.some((step) => step.type === "select_initiative") ??
    false
  );
});

const setupStarted = computed(() => {
  return (
    gameData.value?.steps.some((step) => step.type === "start_setup") ?? false
  );
});

const allShipsPlaced = computed(() => {
  if (!currentGameState.value) return false;
  return currentGameState.value.ships.every((ship) => ship.isPlaced);
});

const turnStarted = computed(() => {
  return (
    gameData.value?.steps.some((step) => step.type === "turn_start") ?? false
  );
});

const isPlanningPhase = computed(() => {
  return currentGameState.value?.currentPhase === GamePhase.Planning;
});

const showTurnAnimation = ref(false);
const previousTurnStarted = ref(false);

watch(
  [allShipsPlaced, turnStarted],
  async ([allPlaced, turnStart]) => {
    if (allPlaced && !turnStart && setupStarted.value) {
      showTurnAnimation.value = true;
      await startTurn();
    }
  },
  { immediate: true }
);

watch(turnStarted, (isTurnStarted) => {
  if (isTurnStarted && !previousTurnStarted.value && allShipsPlaced.value) {
    showTurnAnimation.value = true;
  }
  previousTurnStarted.value = isTurnStarted;
});

async function startTurn() {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "turn_start",
      timestamp: new Date(),
    },
  });
  await refresh();
  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

function handleTurnAnimationComplete() {
  showTurnAnimation.value = false;
}

async function handlePlanningComplete(dials: Record<string, Maneuver>) {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "planning_complete",
      dials,
      timestamp: new Date(),
    },
  });
  await refresh();
  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

async function selectInitiative(playerId: string) {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "select_initiative",
      playerWithInitiative: playerId,
      timestamp: new Date(),
    },
  });
  // Automatically start setup after initiative is selected
  await startSetup();
}

async function startSetup() {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "start_setup",
      timestamp: new Date(),
    },
  });
  await refresh();
}

async function placeShip(shipId: string) {
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "ship_placed",
      shipId,
      timestamp: new Date(),
    },
  });
  await refresh();
  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
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

// In your script section, add these new reactive states:
const activationSubPhase = ref<"select" | "collision" | "action" | null>(null);
const currentActivatingShipId = ref<string | null>(null);

// Add this computed to check if we're in activation phase
const isActivationPhase = computed(() => {
  return currentGameState.value?.currentPhase === GamePhase.Activation;
});

// Add this computed to get the currently activating ship
const currentActivatingShip = computed(() => {
  if (!currentActivatingShipId.value) return null;
  const allShips = [...player1Ships.value, ...player2Ships.value];
  return allShips.find((s) => s.ship.shipId === currentActivatingShipId.value);
});

// Add this function to handle beginning activation phase
async function handleBeginActivation() {
  // Post activation_step to begin the activation phase
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "activation_step",
      shipId: "", // This will be filled when a ship is selected
      timestamp: new Date(),
    },
  });

  await refresh();

  // Set to ship selection sub-phase
  activationSubPhase.value = "select";

  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

// Add this function to handle ship activation selection
async function handleActivateShip(shipId: string) {
  currentActivatingShipId.value = shipId;

  // Post begin_maneuver step
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "begin_maneuver",
      shipId,
      timestamp: new Date(),
    },
  });

  await refresh();

  // Move to collision selection sub-phase
  activationSubPhase.value = "collision";

  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

// Add this function to handle successful maneuver
async function handleSuccessfulManeuver() {
  if (!currentActivatingShipId.value) return;

  // Post clean_maneuver step
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "clean_maneuver",
      shipId: currentActivatingShipId.value,
      timestamp: new Date(),
    },
  });

  await refresh();

  // Move to action selection
  activationSubPhase.value = "action";

  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

// Add this function to handle collision
async function handleCollision(
  collisionType: CollisionType,
  landedOnObstacle: boolean
) {
  if (!currentActivatingShipId.value) return;

  // Post collide step
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "collide",
      shipId: currentActivatingShipId.value,
      collisionType,
      landedOnObstacle,
      timestamp: new Date(),
    },
  });

  await refresh();

  // Move to action selection (or skip if bumped)
  if (collisionType === CollisionType.Ship) {
    // Ship collision skips action, go back to ship selection
    activationSubPhase.value = "select";
    currentActivatingShipId.value = null;
  } else {
    activationSubPhase.value = "action";
  }

  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

// Add this function to handle performing an action
async function handlePerformAction(action: ActionType) {
  if (!currentActivatingShipId.value) return;

  // Post perform_action step
  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: {
      type: "perform_action",
      shipId: currentActivatingShipId.value,
      action,
      timestamp: new Date(),
    },
  });

  await refresh();

  // Ship is done activating, go back to selection
  activationSubPhase.value = "select";
  currentActivatingShipId.value = null;

  if (gameData.value) {
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

// Add this function to handle skipping action
async function handleSkipAction() {
  if (!currentActivatingShipId.value) return;

  // No step needed for skipping action, just go back to selection
  activationSubPhase.value = "select";
  currentActivatingShipId.value = null;
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

      <SelectInitiative
        v-else-if="
          gameStarted &&
          !initiativeSelected &&
          player1Squad &&
          player2Squad &&
          gameData
        "
        :player1-squad="player1Squad"
        :player2-squad="player2Squad"
        :player1-id="gameData.player1Id"
        :player2-id="gameData.player2Id"
        @select-initiative="selectInitiative"
      />

      <StartSetup
        v-else-if="
          gameStarted &&
          initiativeSelected &&
          setupStarted &&
          currentGameState &&
          gameData &&
          !allShipsPlaced
        "
        :player1-ships="player1Ships"
        :player2-ships="player2Ships"
        :player1-id="gameData.player1Id"
        :player2-id="gameData.player2Id"
        :player-with-initiative="currentGameState.playerWithInitiative"
        @place-ship="placeShip"
      />

      <TurnStartAnimation
        v-else-if="
          gameStarted &&
          setupStarted &&
          allShipsPlaced &&
          turnStarted &&
          showTurnAnimation &&
          currentGameState
        "
        :turn-number="currentGameState.totalTurns"
        @complete="handleTurnAnimationComplete"
      />

      <Planning
        v-else-if="
          gameStarted &&
          setupStarted &&
          allShipsPlaced &&
          turnStarted &&
          !showTurnAnimation &&
          isPlanningPhase &&
          currentGameState &&
          gameData
        "
        :player1-ships="player1Ships"
        :player2-ships="player2Ships"
        :player1-id="gameData.player1Id"
        :player2-id="gameData.player2Id"
        :player-with-initiative="currentGameState.playerWithInitiative"
        @complete-planning="handlePlanningComplete"
      />

      <Planning
        v-else-if="
          gameStarted &&
          setupStarted &&
          allShipsPlaced &&
          turnStarted &&
          !showTurnAnimation &&
          isPlanningPhase &&
          currentGameState &&
          gameData
        "
        :player1-ships="player1Ships"
        :player2-ships="player2Ships"
        :player1-id="gameData.player1Id"
        :player2-id="gameData.player2Id"
        :player-with-initiative="currentGameState.playerWithInitiative"
        @complete-planning="handlePlanningComplete"
        @begin-activation="handleBeginActivation"
      />

      <SelectActivation
        v-else-if="
          gameStarted &&
          setupStarted &&
          allShipsPlaced &&
          turnStarted &&
          isActivationPhase &&
          activationSubPhase === 'select' &&
          gameData
        "
        :player1-ships="player1Ships"
        :player2-ships="player2Ships"
        :player1-id="gameData.player1Id"
        :player2-id="gameData.player2Id"
        @activate-ship="handleActivateShip"
      />

      <CollisionSelection
        v-else-if="
          gameStarted &&
          setupStarted &&
          allShipsPlaced &&
          turnStarted &&
          isActivationPhase &&
          activationSubPhase === 'collision' &&
          currentActivatingShip
        "
        :ship="currentActivatingShip.ship"
        :pilot="currentActivatingShip.pilot"
        :player-color="
    currentActivatingShip.ship.playerId === gameData!.player1Id
      ? 'red'
      : 'gray'
  "
        @successful-maneuver="handleSuccessfulManeuver"
        @collision="handleCollision"
      />

      <ActionSelection
        v-else-if="
          gameStarted &&
          setupStarted &&
          allShipsPlaced &&
          turnStarted &&
          isActivationPhase &&
          activationSubPhase === 'action' &&
          currentActivatingShip
        "
        :ship="currentActivatingShip.ship"
        :pilot="currentActivatingShip.pilot"
        :player-color="
    currentActivatingShip.ship.playerId === gameData!.player1Id
      ? 'red'
      : 'gray'
  "
        @perform-action="handlePerformAction"
        @skip-action="handleSkipAction"
      />

      <GameBoard
        v-else-if="
          gameStarted && setupStarted && allShipsPlaced && !isPlanningPhase
        "
        :current-game-state="currentGameState"
      />
    </div>
  </div>
</template>
