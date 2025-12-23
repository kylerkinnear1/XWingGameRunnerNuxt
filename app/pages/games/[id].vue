<script setup lang="ts">
import type { GameStateDto } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import { CurrentGamePage } from "#shared/enums";

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

const expandedShipId = ref<string | null>(null);

const {
  selectedStepIndex,
  previousStepIndex,
  selectStep,
  addStep: addStepFn,
  moveToStepOrPush: moveToStepOrPushFn,
} = useGameSteps(gameId);

const { currentGameState } = useGameState(
  gameData,
  squads,
  cards,
  selectedStepIndex
);

const { transitionName, watchUiScreen } = useGameTransitions(
  selectedStepIndex,
  previousStepIndex
);

watchUiScreen(currentGameState);

const { getPlayerShips, getTotalHull } = useGameShips();

const player1Ships = computed(() => {
  if (!player1Squad.value || !gameData.value) return [];
  return getPlayerShips(
    player1Squad.value,
    gameData.value,
    gameData.value.player1Id,
    currentGameState.value,
    cards.value
  );
});

const player2Ships = computed(() => {
  if (!player2Squad.value || !gameData.value) return [];
  return getPlayerShips(
    player2Squad.value,
    gameData.value,
    gameData.value.player2Id,
    currentGameState.value,
    cards.value
  );
});

const refresh = async () => {
  await refreshGameData();
  if (expandedShipId.value) {
    const allShips = [...player1Ships.value, ...player2Ships.value];
    const shipExists = allShips.some(
      (s) => s.ship.shipId === expandedShipId.value
    );
    if (!shipExists) {
      expandedShipId.value = null;
    }
  }
};

const addStep = (step: import("#shared/game-state-dto").GameStepDto) =>
  addStepFn(step, gameData, refresh);

const moveToStepOrPush = (
  stepType: import("#shared/game-state-dto").GameStepDto["type"],
  step: import("#shared/game-state-dto").GameStepDto
) => moveToStepOrPushFn(stepType, step, gameData, refresh);

const getTotalHullForShip = (shipId: string) =>
  getTotalHull(shipId, squads.value, cards.value);

const {
  addToken,
  removeToken,
  addFacedownDamage,
  removeFacedownDamage,
  assignCrit,
  removeCrit,
  flipCritFacedown,
  addStatModifier,
  decreaseHull,
  decreaseShields,
  flipUpgrade,
} = useGameActions(
  addStep,
  gameData,
  currentGameState,
  cards,
  refresh,
  getTotalHullForShip
);

const {
  startGame,
  handleTurnAnimationComplete,
  handlePlanningComplete,
  selectInitiative,
  startSetup,
  placeShip,
  handleBeginActivation,
  handleActivateShip,
  handleSuccessfulManeuver,
  handleCollision,
  handlePerformAction,
  handleSkipAction,
  handleDoneWithActions,
  handleCombatAnimationComplete,
  handleDeclareAttack,
  handleSelectWeapon,
  handleAttackDiceComplete,
  handleModifyAttackDiceComplete,
  handleSkipAttack,
  handleNoShot,
  handleEndCombat,
  handleDefenseDiceComplete,
  handleEndTurn,
  handleModifyDefenseDiceComplete,
} = useGameHandlers(
  addStep,
  moveToStepOrPush,
  gameData,
  currentGameState,
  selectedStepIndex,
  gameId,
  refresh
);

const {
  currentRollAttackDiceCount,
  currentAttackDice,
  currentRollDefenseDiceCount,
  currentDefenseDice,
} = useGameDice(
  gameData,
  selectedStepIndex,
  currentGameState,
  player1Ships,
  player2Ships
);

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

function toggleShipExpansion(shipId: string) {
  expandedShipId.value = expandedShipId.value === shipId ? null : shipId;
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
</script>

<template>
  <div class="h-full flex bg-gray-900 overflow-hidden">
    <GameStepsList
      :steps="gameData?.steps || []"
      :selected-index="selectedStepIndex"
      :loading="gamePending"
      :error="!!gameError"
      @select-step="selectStep"
    />

    <GameShipsDrawer
      :player1-ships="player1Ships"
      :player2-ships="player2Ships"
      :expanded-ship-id="expandedShipId"
      @toggle-expansion="toggleShipExpansion"
      @add-token="addToken"
      @remove-token="removeToken"
      @add-facedown-damage="addFacedownDamage"
      @remove-facedown-damage="removeFacedownDamage"
      @assign-crit="assignCrit"
      @remove-crit="removeCrit"
      @flip-crit-facedown="flipCritFacedown"
      @flip-upgrade="flipUpgrade"
      @add-stat-modifier="addStatModifier"
      @decrease-hull="decreaseHull"
      @decrease-shields="decreaseShields"
    />

    <div class="flex-1 overflow-hidden relative game-transition-container">
      <Transition :name="transitionName" mode="out-in">
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

        <CombatStartAnimation
          v-else-if="currentGameState?.uiScreen === CurrentGamePage.CombatStart"
          :key="`${CurrentGamePage.CombatStart}-${currentGameState.totalTurns}`"
          @complete="handleCombatAnimationComplete"
        />

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
          @end-combat="handleEndCombat"
        />

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

        <CombatModifyAttackDice
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.ModifyAttackDice
          "
          :key="`${CurrentGamePage.ModifyAttackDice}-${selectedStepIndex}`"
          :initial-dice="currentAttackDice"
          @confirm="handleModifyAttackDiceComplete"
        />

        <div
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.RollDefenseDice
          "
          :key="`${CurrentGamePage.RollDefenseDice}-${selectedStepIndex}`"
        >
          <CombatDefenseDice
            :initial-count="currentRollDefenseDiceCount"
            @complete="handleDefenseDiceComplete"
          />
        </div>

        <CombatModifyDefenseDice
          v-else-if="
            currentGameState?.uiScreen === CurrentGamePage.ModifyDefenseDice
          "
          :key="`${CurrentGamePage.ModifyDefenseDice}-${selectedStepIndex}`"
          :initial-dice="currentDefenseDice"
          @confirm="handleModifyDefenseDiceComplete"
        />

        <CombatCleanupAnimation
          v-else-if="currentGameState?.uiScreen === CurrentGamePage.Cleanup"
          :key="`${CurrentGamePage.Cleanup}-${currentGameState.totalTurns}`"
          @end-turn="handleEndTurn"
        />

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
