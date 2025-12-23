import type { Maneuver, ActionType, CollisionType } from "#shared/enums";
import type { GameStepDto } from "#shared/game-state-dto";
import type { CurrentGameState } from "#shared/game-state-dto";
import type { AttackDieFace, DefenseDieFace } from "#shared/dice";

export const useGameHandlers = (
  addStep: (
    step: GameStepDto,
    gameData: Ref<{ steps: GameStepDto[] } | null>,
    refreshCallback: () => Promise<void>
  ) => Promise<void>,
  moveToStepOrPush: (
    stepType: GameStepDto["type"],
    step: GameStepDto,
    gameData: Ref<{ steps: GameStepDto[] } | null>,
    refreshCallback: () => Promise<void>
  ) => Promise<void>,
  gameData: Ref<{ steps: GameStepDto[] } | null>,
  currentGameState: Ref<CurrentGameState | null>,
  selectedStepIndex: Ref<number>,
  gameId: string,
  refreshCallback: () => Promise<void>
) => {
  const startGame = async () => {
    await addStep(
      {
        type: "begin_select_initiative",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleTurnAnimationComplete = async () => {
    await moveToStepOrPush(
      "planning",
      {
        type: "planning",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handlePlanningComplete = async (dials: Record<string, Maneuver>) => {
    await addStep(
      {
        type: "planning_complete",
        dials,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const selectInitiative = async (playerId: string) => {
    await addStep(
      {
        type: "initiative_selected",
        playerWithInitiative: playerId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
    await startSetup();
  };

  const startSetup = async () => {
    await addStep(
      {
        type: "start_setup",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const placeShip = async (shipId: string) => {
    await addStep(
      {
        type: "ship_placed",
        shipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    await refreshCallback();

    if (currentGameState.value) {
      const allPlaced = currentGameState.value.ships.every((s) => s.isPlaced);
      if (allPlaced) {
        await moveToStepOrPush(
          "turn_start",
          {
            type: "turn_start",
            timestamp: new Date(),
          },
          gameData,
          refreshCallback
        );
      }
    }
  };

  const handleBeginActivation = async () => {
    await addStep(
      {
        type: "activation_step",
        shipId: "",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleActivateShip = async (shipId: string) => {
    await addStep(
      {
        type: "begin_maneuver",
        shipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleSuccessfulManeuver = async () => {
    if (!currentGameState.value?.currentActivatingShipId) return;

    await addStep(
      {
        type: "clean_maneuver",
        shipId: currentGameState.value.currentActivatingShipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleCollision = async (
    collisionType: CollisionType,
    landedOnObstacle: boolean
  ) => {
    if (!currentGameState.value?.currentActivatingShipId) return;

    await addStep(
      {
        type: "collide",
        shipId: currentGameState.value.currentActivatingShipId,
        collisionType,
        landedOnObstacle,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    if (collisionType === CollisionType.Ship) {
      await refreshCallback();
      if (currentGameState.value) {
        const allActivated = currentGameState.value.ships.every(
          (s) => s.hasActivated || s.isDestroyed
        );
        if (allActivated) {
          await moveToStepOrPush(
            "combat_step",
            {
              type: "combat_step",
              pilotSkill: 0,
              timestamp: new Date(),
            },
            gameData,
            refreshCallback
          );
        } else {
          await moveToStepOrPush(
            "activation_step",
            {
              type: "activation_step",
              shipId: "",
              timestamp: new Date(),
            },
            gameData,
            refreshCallback
          );
        }
      }
    } else {
      await addStep(
        {
          type: "select_action_again",
          shipId: currentGameState.value.currentActivatingShipId,
          timestamp: new Date(),
        },
        gameData,
        refreshCallback
      );
    }
  };

  const handlePerformAction = async (action: ActionType) => {
    if (!currentGameState.value?.currentActivatingShipId) return;

    const shipId = currentGameState.value.currentActivatingShipId;

    await addStep(
      {
        type: "perform_action",
        shipId,
        action,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    await addStep(
      {
        type: "select_action_again",
        shipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleSkipAction = async () => {
    if (!currentGameState.value?.currentActivatingShipId) return;

    const shipId = currentGameState.value.currentActivatingShipId;

    await addStep(
      {
        type: "action_skipped",
        shipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    await refreshCallback();

    if (currentGameState.value) {
      const allActivated = currentGameState.value.ships.every(
        (s) => s.hasActivated || s.isDestroyed
      );
      if (allActivated) {
        await moveToStepOrPush(
          "combat_step",
          {
            type: "combat_step",
            pilotSkill: 0,
            timestamp: new Date(),
          },
          gameData,
          refreshCallback
        );
      } else {
        await moveToStepOrPush(
          "activation_step",
          {
            type: "activation_step",
            shipId: "",
            timestamp: new Date(),
          },
          gameData,
          refreshCallback
        );
      }
    }
  };

  const handleDoneWithActions = async () => {
    if (!currentGameState.value?.currentActivatingShipId) return;

    const shipId = currentGameState.value.currentActivatingShipId;

    await addStep(
      {
        type: "done_with_actions",
        shipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    await refreshCallback();

    if (currentGameState.value) {
      const allActivated = currentGameState.value.ships.every(
        (s) => s.hasActivated || s.isDestroyed
      );
      if (allActivated) {
        await moveToStepOrPush(
          "combat_step",
          {
            type: "combat_step",
            pilotSkill: 0,
            timestamp: new Date(),
          },
          gameData,
          refreshCallback
        );
      } else {
        await moveToStepOrPush(
          "activation_step",
          {
            type: "activation_step",
            shipId: "",
            timestamp: new Date(),
          },
          gameData,
          refreshCallback
        );
      }
    }
  };

  const handleCombatAnimationComplete = async () => {
    await moveToStepOrPush(
      "declare_attackers",
      {
        type: "declare_attackers",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleDeclareAttack = async (
    attackerShipId: string,
    defenderShipId: string
  ) => {
    await addStep(
      {
        type: "select_weapon",
        attackerShipId,
        defenderShipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleSelectWeapon = async (
    weaponId: string,
    baseAttackDice: number
  ) => {
    if (
      !currentGameState.value?.currentAttackingShipId ||
      !currentGameState.value?.currentDefendingShipId
    )
      return;

    await addStep(
      {
        type: "roll_attack_dice",
        weaponId,
        baseAttackDice,
        results: [],
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleAttackDiceComplete = async (dice: any[]) => {
    if (!gameData.value || !currentGameState.value?.currentAttackingShipId)
      return;

    const currentStep = gameData.value.steps[selectedStepIndex.value];
    if (currentStep && currentStep.type === "roll_attack_dice") {
      const results = dice.map((die) => die.face);

      await addStep(
        {
          type: "modify_attack_dice",
          attackerShipId: currentGameState.value.currentAttackingShipId,
          beforeResults: results,
          afterResults: results,
          timestamp: new Date(),
        },
        gameData,
        refreshCallback
      );
    }
  };

  const handleModifyAttackDiceComplete = async (dice: any[]) => {
    if (!gameData.value || !currentGameState.value?.currentAttackingShipId)
      return;

    const currentStep = gameData.value.steps[selectedStepIndex.value];
    if (currentStep && currentStep.type === "modify_attack_dice") {
      const beforeResults = currentStep.beforeResults;
      const afterResults = dice.map((die) => die.face);

      const currentIndex = selectedStepIndex.value;
      const previousIndex = currentIndex - 1;

      if (previousIndex >= 0) {
        await $fetch(`/api/games/${gameId}/steps/truncate`, {
          method: "POST",
          body: {
            afterIndex: previousIndex,
          },
        });
      }

      await $fetch(`/api/games/${gameId}/steps`, {
        method: "POST",
        body: {
          type: "modify_attack_dice",
          attackerShipId: currentGameState.value.currentAttackingShipId,
          beforeResults,
          afterResults,
          timestamp: new Date(),
        },
      });

      if (currentGameState.value.currentDefendingShipId) {
        await $fetch(`/api/games/${gameId}/steps`, {
          method: "POST",
          body: {
            type: "roll_defense_dice",
            defenderShipId: currentGameState.value.currentDefendingShipId,
            results: [],
            timestamp: new Date(),
          },
        });
      }

      await refreshCallback();

      if (gameData.value) {
        selectedStepIndex.value = gameData.value.steps.length - 1;
      }
    }
  };

  const handleSkipAttack = async () => {
    if (!currentGameState.value?.currentAttackingShipId) return;

    await addStep(
      {
        type: "skip_attack",
        shipId: currentGameState.value.currentAttackingShipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleNoShot = async () => {
    await addStep(
      {
        type: "combat_step",
        pilotSkill: 0,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleEndCombat = async () => {
    await moveToStepOrPush(
      "cleanup",
      {
        type: "cleanup",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleDefenseDiceComplete = async (dice: any[]) => {
    if (!gameData.value || !currentGameState.value?.currentDefendingShipId)
      return;

    const currentStep = gameData.value.steps[selectedStepIndex.value];
    if (currentStep && currentStep.type === "roll_defense_dice") {
      const results = dice.map((die) => die.face);

      await addStep(
        {
          type: "modify_defense_dice",
          defenderShipId: currentGameState.value.currentDefendingShipId,
          beforeResults: results,
          afterResults: results,
          timestamp: new Date(),
        },
        gameData,
        refreshCallback
      );
    }
  };

  const handleEndTurn = async () => {
    await moveToStepOrPush(
      "turn_start",
      {
        type: "turn_start",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const handleModifyDefenseDiceComplete = async (dice: any[]) => {
    if (!gameData.value || !currentGameState.value?.currentDefendingShipId)
      return;

    const currentStep = gameData.value.steps[selectedStepIndex.value];
    if (currentStep && currentStep.type === "modify_defense_dice") {
      const beforeResults = currentStep.beforeResults;
      const afterResults = dice.map((die) => die.face);

      const currentIndex = selectedStepIndex.value;
      const previousIndex = currentIndex - 1;

      if (previousIndex >= 0) {
        await $fetch(`/api/games/${gameId}/steps/truncate`, {
          method: "POST",
          body: {
            afterIndex: previousIndex,
          },
        });
      }

      await $fetch(`/api/games/${gameId}/steps`, {
        method: "POST",
        body: {
          type: "modify_defense_dice",
          defenderShipId: currentGameState.value.currentDefendingShipId,
          beforeResults,
          afterResults,
          timestamp: new Date(),
        },
      });

      await refreshCallback();

      if (gameData.value && currentGameState.value?.currentAttackingShipId) {
        selectedStepIndex.value = gameData.value.steps.length - 1;

        await addStep(
          {
            type: "complete_attack",
            attackerShipId: currentGameState.value.currentAttackingShipId,
            timestamp: new Date(),
          },
          gameData,
          refreshCallback
        );

        await nextTick();
        await refreshCallback();

        if (currentGameState.value) {
          const shipsAvailableToAttack = currentGameState.value.ships.filter(
            (s) => !s.hasAttacked && !s.isDestroyed
          );
          if (shipsAvailableToAttack.length === 0) {
            await moveToStepOrPush(
              "cleanup",
              {
                type: "cleanup",
                timestamp: new Date(),
              },
              gameData,
              refreshCallback
            );
          } else {
            await moveToStepOrPush(
              "declare_attackers",
              {
                type: "declare_attackers",
                timestamp: new Date(),
              },
              gameData,
              refreshCallback
            );
          }
        }
      }
    }
  };

  return {
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
  };
};

