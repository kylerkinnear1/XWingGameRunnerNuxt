<script setup lang="ts">
import type { GameStateDto, ShipStateDto } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import type { TokenType, Maneuver, ActionType } from "#shared/enums";
import type { AttackDieFace } from "#shared/dice";
import { CollisionType, GamePhase, CurrentGamePage } from "#shared/enums";
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
const previousStepIndex = ref(0);
const expandedShipId = ref<string | null>(null);
const previousUiScreen = ref<CurrentGamePage | null>(null);

// Track navigation direction for transitions
const transitionDirection = computed(() => {
  return selectedStepIndex.value > previousStepIndex.value
    ? "forward"
    : "backward";
});

const transitionName = computed(() => {
  const baseTransition =
    transitionDirection.value === "forward" ? "slide-up" : "slide-down";

  const previousScreen = previousUiScreen.value;
  const currentScreen = currentGameState.value?.uiScreen;

  // Suppress both enter and leave when transitioning from RollAttackDice to ModifyAttackDice
  if (
    previousScreen === CurrentGamePage.RollAttackDice &&
    currentScreen === CurrentGamePage.ModifyAttackDice
  ) {
    return `${baseTransition}-no-enter-no-leave`;
  }

  // Suppress leave transition when leaving RollAttackDice
  if (previousScreen === CurrentGamePage.RollAttackDice) {
    return `${baseTransition}-no-leave`;
  }

  return baseTransition;
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

// Watch for uiScreen changes to track previous screen
const currentUiScreen = ref<CurrentGamePage | null>(null);
watch(
  () => currentGameState.value?.uiScreen,
  (newScreen) => {
    if (newScreen && currentUiScreen.value !== newScreen) {
      previousUiScreen.value = currentUiScreen.value;
      currentUiScreen.value = newScreen;
    } else if (newScreen && !currentUiScreen.value) {
      currentUiScreen.value = newScreen;
    }
  },
  { immediate: true }
);

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
  previousStepIndex.value = selectedStepIndex.value;
  selectedStepIndex.value = index;
}

watch(
  [gameData, cards, squads],
  async () => {
    if (!gameData.value || !cards.value || !squads.value.length) return;

    const hasGameStartStep = gameData.value.steps.some(
      (step) => step.type === "game_start"
    );

    if (!hasGameStartStep && gameData.value.steps.length === 0) {
      await addStep({
        type: "game_start",
        timestamp: new Date(),
      });
    }
  },
  { immediate: true }
);

watch(
  [selectedStepIndex, gameData],
  async () => {
    if (!gameData.value) return;

    const currentStep = gameData.value.steps[selectedStepIndex.value];
    if (!currentStep) return;

    await nextTick();

    let expectedStepType: string | null = null;

    if (currentStep.type === "action_skipped") {
      if (!currentGameState.value) return;

      const allActivated = currentGameState.value.ships.every(
        (s) => s.hasActivated || s.isDestroyed
      );
      expectedStepType = allActivated ? "combat_step" : "activation_step";
    } else if (currentStep.type === "turn_start") {
      expectedStepType = "planning";
    }

    if (!expectedStepType) return;

    const nextIndex = selectedStepIndex.value + 1;
    const nextStep = gameData.value.steps[nextIndex];

    if (nextStep && nextStep.type === expectedStepType) {
      previousStepIndex.value = selectedStepIndex.value;
      selectedStepIndex.value = nextIndex;
    }
  },
  { immediate: false }
);

function toggleShipExpansion(shipId: string) {
  expandedShipId.value = expandedShipId.value === shipId ? null : shipId;
}

async function addToken(shipId: string, tokenType: TokenType) {
  await addStep({
    type: "assign_token",
    sourceShipId: shipId,
    tokenType,
    conditionId: null,
    reinforceDirection: null,
    targetShipId: null,
    timestamp: new Date(),
  });
}

async function removeToken(shipId: string, tokenType: TokenType) {
  await addStep({
    type: "spend_token",
    shipId,
    tokenType,
    timestamp: new Date(),
  });
}

async function startGame() {
  await addStep({
    type: "begin_select_initiative",
    timestamp: new Date(),
  });
}

async function handleTurnAnimationComplete() {
  await moveToStepOrPush("planning", {
    type: "planning",
    timestamp: new Date(),
  });
}

async function handlePlanningComplete(dials: Record<string, Maneuver>) {
  await addStep({
    type: "planning_complete",
    dials,
    timestamp: new Date(),
  });
}

async function selectInitiative(playerId: string) {
  await addStep({
    type: "initiative_selected",
    playerWithInitiative: playerId,
    timestamp: new Date(),
  });
  // Automatically start setup after initiative is selected
  await startSetup();
}

async function startSetup() {
  await addStep({
    type: "start_setup",
    timestamp: new Date(),
  });
}

async function placeShip(shipId: string) {
  await addStep({
    type: "ship_placed",
    shipId,
    timestamp: new Date(),
  });

  await refresh();

  if (currentGameState.value) {
    const allPlaced = currentGameState.value.ships.every((s) => s.isPlaced);
    if (allPlaced) {
      await moveToStepOrPush("turn_start", {
        type: "turn_start",
        timestamp: new Date(),
      });
    }
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

async function addStep(step: import("#shared/game-state-dto").GameStepDto) {
  if (!gameData.value) return;

  const currentIndex = selectedStepIndex.value;
  const totalSteps = gameData.value.steps.length;
  const isAtEnd = currentIndex === totalSteps - 1;

  if (!isAtEnd && totalSteps > 0) {
    await $fetch(`/api/games/${gameId}/steps/truncate`, {
      method: "POST",
      body: {
        afterIndex: currentIndex,
      },
    });
  }

  await $fetch(`/api/games/${gameId}/steps`, {
    method: "POST",
    body: step,
  });

  await refresh();

  if (gameData.value) {
    previousStepIndex.value = selectedStepIndex.value;
    selectedStepIndex.value = gameData.value.steps.length - 1;
  }
}

async function moveToStepOrPush(
  stepType: import("#shared/game-state-dto").GameStepDto["type"],
  step: import("#shared/game-state-dto").GameStepDto
) {
  if (!gameData.value) return;

  const currentIndex = selectedStepIndex.value;
  const nextIndex = currentIndex + 1;
  const nextStep = gameData.value.steps[nextIndex];

  if (nextStep && nextStep.type === stepType) {
    previousStepIndex.value = selectedStepIndex.value;
    selectedStepIndex.value = nextIndex;
    await refresh();
  } else {
    await addStep(step);
  }
}

const currentActivatingShip = computed(() => {
  if (!currentGameState.value?.currentActivatingShipId) return null;
  const allShips = [...player1Ships.value, ...player2Ships.value];
  return allShips.find(
    (s) => s.ship.shipId === currentGameState.value!.currentActivatingShipId
  );
});

const currentAttackingShip = computed(() => {
  if (!currentGameState.value?.currentAttackingShipId) return null;
  const allShips = [...player1Ships.value, ...player2Ships.value];
  return allShips.find(
    (s) => s.ship.shipId === currentGameState.value!.currentAttackingShipId
  );
});

const currentDefendingShip = computed(() => {
  if (!currentGameState.value?.currentDefendingShipId) return null;
  const allShips = [...player1Ships.value, ...player2Ships.value];
  return allShips.find(
    (s) => s.ship.shipId === currentGameState.value!.currentDefendingShipId
  );
});

async function handleBeginActivation() {
  await addStep({
    type: "activation_step",
    shipId: "",
    timestamp: new Date(),
  });
}

async function handleActivateShip(shipId: string) {
  await addStep({
    type: "begin_maneuver",
    shipId,
    timestamp: new Date(),
  });
}

async function handleSuccessfulManeuver() {
  if (!currentGameState.value?.currentActivatingShipId) return;

  await addStep({
    type: "clean_maneuver",
    shipId: currentGameState.value.currentActivatingShipId,
    timestamp: new Date(),
  });
}

async function handleCollision(
  collisionType: CollisionType,
  landedOnObstacle: boolean
) {
  if (!currentGameState.value?.currentActivatingShipId) return;

  await addStep({
    type: "collide",
    shipId: currentGameState.value.currentActivatingShipId,
    collisionType,
    landedOnObstacle,
    timestamp: new Date(),
  });

  if (collisionType === CollisionType.Ship) {
    await refresh();
    if (currentGameState.value) {
      const allActivated = currentGameState.value.ships.every(
        (s) => s.hasActivated || s.isDestroyed
      );
      if (allActivated) {
        await moveToStepOrPush("combat_step", {
          type: "combat_step",
          pilotSkill: 0,
          timestamp: new Date(),
        });
      } else {
        await moveToStepOrPush("activation_step", {
          type: "activation_step",
          shipId: "",
          timestamp: new Date(),
        });
      }
    }
  } else {
    await addStep({
      type: "select_action_again",
      shipId: currentGameState.value.currentActivatingShipId,
      timestamp: new Date(),
    });
  }
}

async function handlePerformAction(action: ActionType) {
  if (!currentGameState.value?.currentActivatingShipId) return;

  const shipId = currentGameState.value.currentActivatingShipId;

  await addStep({
    type: "perform_action",
    shipId,
    action,
    timestamp: new Date(),
  });

  await addStep({
    type: "select_action_again",
    shipId,
    timestamp: new Date(),
  });
}

async function handleSkipAction() {
  if (!currentGameState.value?.currentActivatingShipId) return;

  const shipId = currentGameState.value.currentActivatingShipId;

  await addStep({
    type: "action_skipped",
    shipId,
    timestamp: new Date(),
  });

  await refresh();

  if (currentGameState.value) {
    const allActivated = currentGameState.value.ships.every(
      (s) => s.hasActivated || s.isDestroyed
    );
    if (allActivated) {
      await moveToStepOrPush("combat_step", {
        type: "combat_step",
        pilotSkill: 0,
        timestamp: new Date(),
      });
    } else {
      await moveToStepOrPush("activation_step", {
        type: "activation_step",
        shipId: "",
        timestamp: new Date(),
      });
    }
  }
}

async function handleDoneWithActions() {
  if (!currentGameState.value?.currentActivatingShipId) return;

  const shipId = currentGameState.value.currentActivatingShipId;

  await addStep({
    type: "done_with_actions",
    shipId,
    timestamp: new Date(),
  });

  await refresh();

  if (currentGameState.value) {
    const allActivated = currentGameState.value.ships.every(
      (s) => s.hasActivated || s.isDestroyed
    );
    if (allActivated) {
      await moveToStepOrPush("combat_step", {
        type: "combat_step",
        pilotSkill: 0,
        timestamp: new Date(),
      });
    } else {
      await moveToStepOrPush("activation_step", {
        type: "activation_step",
        shipId: "",
        timestamp: new Date(),
      });
    }
  }
}

async function handleCombatAnimationComplete() {
  await moveToStepOrPush("declare_attackers", {
    type: "declare_attackers",
    timestamp: new Date(),
  });
}

async function handleDeclareAttack(
  attackerShipId: string,
  defenderShipId: string
) {
  await addStep({
    type: "select_weapon",
    attackerShipId,
    defenderShipId,
    timestamp: new Date(),
  });
}

const currentRollAttackDiceCount = computed(() => {
  if (!gameData.value) return 3;
  const currentStep = gameData.value.steps[selectedStepIndex.value];
  if (currentStep && currentStep.type === "roll_attack_dice") {
    return currentStep.baseAttackDice || 3;
  }
  return 3;
});

const currentAttackDice = computed(() => {
  if (!gameData.value) return [];
  const currentStep = gameData.value.steps[selectedStepIndex.value];

  // If we're on a modify_attack_dice step, use its afterResults
  if (currentStep && currentStep.type === "modify_attack_dice") {
    return currentStep.afterResults.map((result, index) => ({
      id: `die-${index}`,
      face: result as AttackDieFace,
    }));
  }

  // Otherwise, look for roll_attack_dice step with results
  if (
    currentStep &&
    currentStep.type === "roll_attack_dice" &&
    currentStep.results
  ) {
    return currentStep.results.map((result, index) => ({
      id: `die-${index}`,
      face: result as AttackDieFace,
    }));
  }

  return [];
});

async function handleSelectWeapon(weaponId: string, baseAttackDice: number) {
  if (
    !currentGameState.value?.currentAttackingShipId ||
    !currentGameState.value?.currentDefendingShipId
  )
    return;

  await addStep({
    type: "roll_attack_dice",
    weaponId,
    baseAttackDice,
    results: [],
    timestamp: new Date(),
  });
}

async function handleAttackDiceComplete(dice: any[]) {
  if (!gameData.value || !currentGameState.value?.currentAttackingShipId)
    return;

  const currentStep = gameData.value.steps[selectedStepIndex.value];
  if (currentStep && currentStep.type === "roll_attack_dice") {
    const results = dice.map((die) => die.face);

    // Push modify_attack_dice step directly - this will show ModifyAttackDice UI
    await addStep({
      type: "modify_attack_dice",
      attackerShipId: currentGameState.value.currentAttackingShipId,
      beforeResults: results,
      afterResults: results,
      timestamp: new Date(),
    });
  }
}

async function handleModifyAttackDiceComplete(dice: any[]) {
  if (!gameData.value || !currentGameState.value?.currentAttackingShipId)
    return;

  const currentStep = gameData.value.steps[selectedStepIndex.value];
  if (currentStep && currentStep.type === "modify_attack_dice") {
    const beforeResults = currentStep.beforeResults;
    const afterResults = dice.map((die) => die.face);

    // Update the modify_attack_dice step with final results
    await addStep({
      type: "modify_attack_dice",
      attackerShipId: currentGameState.value.currentAttackingShipId,
      beforeResults,
      afterResults,
      timestamp: new Date(),
    });

    // Move to next phase - push roll_defense_dice step
    if (currentGameState.value.currentDefendingShipId) {
      await addStep({
        type: "roll_defense_dice",
        defenderShipId: currentGameState.value.currentDefendingShipId,
        results: [],
        timestamp: new Date(),
      });
    }
  }
}

async function handleSkipAttack() {
  if (!currentGameState.value?.currentAttackingShipId) return;

  await addStep({
    type: "skip_attack",
    shipId: currentGameState.value.currentAttackingShipId,
    timestamp: new Date(),
  });
}

async function handleNoShot() {
  // Mark this as no shot and move to next step
  await addStep({
    type: "combat_step",
    pilotSkill: 0,
    timestamp: new Date(),
  });
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
    <GameShipsDrawer
      :player1-ships="player1Ships"
      :player2-ships="player2Ships"
      :expanded-ship-id="expandedShipId"
      @toggle-expansion="toggleShipExpansion"
      @add-token="addToken"
      @remove-token="removeToken"
    />

    <!-- Main Game Area - Switch based on uiScreen with transitions -->
    <div class="flex-1 overflow-hidden relative game-transition-container">
      <Transition :name="transitionName" mode="out-in">
        <!-- Game Start Animation -->
        <GameStartAnimation
          v-if="
            currentGameState?.uiScreen === CurrentGamePage.GameStart &&
            player1Squad &&
            player2Squad
          "
          :key="CurrentGamePage.GameStart"
          :player1Squad="player1Squad"
          :player2Squad="player2Squad"
          @start="startGame"
        />

        <!-- Select Initiative -->
        <SetupSelectInitiative
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.SelectInitiative &&
            player1Squad &&
            player2Squad &&
            gameData
          "
          :key="CurrentGamePage.SelectInitiative"
          :player1-squad="player1Squad"
          :player2-squad="player2Squad"
          :player1-id="gameData.player1Id"
          :player2-id="gameData.player2Id"
          @select-initiative="selectInitiative"
        />

        <!-- Setup Phase -->
        <SetupStart
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.Setup && gameData
          "
          :key="CurrentGamePage.Setup"
          :player1-ships="player1Ships"
          :player2-ships="player2Ships"
          :player1-id="gameData.player1Id"
          :player2-id="gameData.player2Id"
          :player-with-initiative="currentGameState.playerWithInitiative"
          @place-ship="placeShip"
        />

        <!-- Turn Start Animation -->
        <ActivationTurnStartAnimation
          v-else-if="currentGameState?.uiScreen === CurrentGamePage.TurnStart"
          :key="`${CurrentGamePage.TurnStart}-${currentGameState.totalTurns}`"
          :turn-number="currentGameState.totalTurns"
          @complete="handleTurnAnimationComplete"
        />

        <Planning
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.Planning && gameData
          "
          :key="`${CurrentGamePage.Planning}-${currentGameState.totalTurns}`"
          :player1-ships="player1Ships"
          :player2-ships="player2Ships"
          :player1-id="gameData.player1Id"
          :player2-id="gameData.player2Id"
          :player-with-initiative="currentGameState.playerWithInitiative"
          @complete-planning="handlePlanningComplete"
          @begin-activation="handleBeginActivation"
        />

        <!-- Select Ship to Activate -->
        <ActivationSelect
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.SelectActivation &&
            gameData
          "
          :key="`${CurrentGamePage.SelectActivation}-${selectedStepIndex}`"
          :player1-ships="player1Ships"
          :player2-ships="player2Ships"
          :player1-id="gameData.player1Id"
          :player2-id="gameData.player2Id"
          @activate-ship="handleActivateShip"
        />

        <!-- Collision Selection -->
        <ActivationCollisionSelection
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.CollisionSelection &&
            currentActivatingShip
          "
          :key="`${CurrentGamePage.CollisionSelection}-${currentActivatingShip.ship.shipId}`"
          :ship="currentActivatingShip.ship"
          :pilot="currentActivatingShip.pilot"
          :player-color="currentActivatingShip.ship.playerId === gameData!.player1Id ? 'red' : 'gray'"
          @successful-maneuver="handleSuccessfulManeuver"
          @collision="handleCollision"
        />

        <!-- Action Selection -->
        <ActivationActionSelection
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.ActionSelection &&
            currentActivatingShip
          "
          :key="`${CurrentGamePage.ActionSelection}-${currentActivatingShip.ship.shipId}-${selectedStepIndex}`"
          :ship="currentActivatingShip.ship"
          :pilot="currentActivatingShip.pilot"
          :player-color="currentActivatingShip.ship.playerId === gameData!.player1Id ? 'red' : 'gray'"
          @perform-action="handlePerformAction"
          @skip-action="handleSkipAction"
          @done-with-actions="handleDoneWithActions"
        />

        <!-- Combat Start Animation -->
        <CombatStartAnimation
          v-else-if="currentGameState?.uiScreen === CurrentGamePage.CombatStart"
          :key="`${CurrentGamePage.CombatStart}-${currentGameState.totalTurns}`"
          @complete="handleCombatAnimationComplete"
        />

        <!-- Select Target -->
        <CombatSelectTarget
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.SelectTarget &&
            gameData
          "
          :key="`${CurrentGamePage.SelectTarget}-${selectedStepIndex}`"
          :player1-ships="player1Ships"
          :player2-ships="player2Ships"
          :player1-id="gameData.player1Id"
          :player2-id="gameData.player2Id"
          @declare-attack="handleDeclareAttack"
          @no-shot="handleNoShot"
        />

        <!-- Select Weapon -->
        <CombatSelectWeapon
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.SelectWeapon &&
            currentAttackingShip &&
            currentDefendingShip
          "
          :key="`${CurrentGamePage.SelectWeapon}-${currentAttackingShip.ship.shipId}-${currentDefendingShip.ship.shipId}`"
          :attacking-ship="currentAttackingShip"
          :defending-ship="currentDefendingShip"
          :player-color="currentAttackingShip.ship.playerId === gameData!.player1Id ? 'red' : 'gray'"
          @select-weapon="handleSelectWeapon"
          @skip-attack="handleSkipAttack"
        />

        <!-- Roll Attack Dice -->
        <div
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.RollAttackDice
          "
          :key="`${CurrentGamePage.RollAttackDice}-${selectedStepIndex}`"
        >
          <CombatAttackDice
            :initial-count="currentRollAttackDiceCount"
            @complete="handleAttackDiceComplete"
          />
        </div>

        <!-- Modify Attack Dice -->
        <CombatModifyAttackDice
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.ModifyAttackDice
          "
          :key="`${CurrentGamePage.ModifyAttackDice}-${selectedStepIndex}`"
          :initial-dice="currentAttackDice"
          @confirm="handleModifyAttackDiceComplete"
        />

        <!-- Game Board (fallback) -->
        <GameBoard
          v-else
          :key="`${
            currentGameState?.uiScreen || 'default'
          }-${selectedStepIndex}`"
          :current-game-state="currentGameState"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Container for gradient masks */
.game-transition-container {
  position: relative;
}

.game-transition-container::before,
.game-transition-container::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 100px;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.game-transition-container::before {
  top: 0;
  background: linear-gradient(to bottom, rgb(17, 24, 39), transparent);
}

.game-transition-container::after {
  bottom: 0;
  background: linear-gradient(to top, rgb(17, 24, 39), transparent);
}

/* Show gradients during transitions */
.game-transition-container:has(.slide-up-enter-active),
.game-transition-container:has(.slide-up-leave-active),
.game-transition-container:has(.slide-down-enter-active),
.game-transition-container:has(.slide-down-leave-active) {
  &::before,
  &::after {
    opacity: 1;
  }
}

/* Slide Up - Moving Forward in Time */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Slide Up with no leave transition */
.slide-up-no-leave-enter-active {
  transition: all 0.3s ease-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-no-leave-leave-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-no-leave-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-no-leave-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-leave-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-leave-leave-to {
  transform: translateY(0);
  opacity: 1;
}

/* Slide Up with no enter transition */
.slide-up-no-enter-enter-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-no-enter-leave-active {
  transition: all 0.3s ease-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-no-enter-enter-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-enter-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-enter-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-enter-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Slide Up with no enter and no leave transition */
.slide-up-no-enter-no-leave-enter-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-no-enter-no-leave-leave-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-up-no-enter-no-leave-enter-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-enter-no-leave-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-enter-no-leave-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-no-enter-no-leave-leave-to {
  transform: translateY(0);
  opacity: 1;
}

/* Slide Down - Moving Backward in Time */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Slide Down with no leave transition */
.slide-down-no-leave-enter-active {
  transition: all 0.3s ease-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-no-leave-leave-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-no-leave-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-no-leave-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-leave-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-leave-leave-to {
  transform: translateY(0);
  opacity: 1;
}

/* Slide Down with no enter transition */
.slide-down-no-enter-enter-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-no-enter-leave-active {
  transition: all 0.3s ease-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-no-enter-enter-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-enter-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-enter-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-enter-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Slide Down with no enter and no leave transition */
.slide-down-no-enter-no-leave-enter-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-no-enter-no-leave-leave-active {
  transition: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-down-no-enter-no-leave-enter-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-enter-no-leave-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-enter-no-leave-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-down-no-enter-no-leave-leave-to {
  transform: translateY(0);
  opacity: 1;
}
</style>
