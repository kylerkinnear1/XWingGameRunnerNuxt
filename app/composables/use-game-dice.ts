import type { AttackDieFace, DefenseDieFace } from "#shared/dice";
import type { GameStepDto } from "#shared/game-state-dto";
import type { CurrentGameState } from "#shared/game-state-dto";

export const useGameDice = (
  gameData: Ref<{ steps: GameStepDto[] } | null>,
  selectedStepIndex: Ref<number>,
  currentGameState: Ref<CurrentGameState | null>,
  player1Ships: Ref<Array<{ ship: any; pilot: any }>>,
  player2Ships: Ref<Array<{ ship: any; pilot: any }>>
) => {
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

    if (currentStep && currentStep.type === "modify_attack_dice") {
      return currentStep.afterResults.map((result, index) => ({
        id: `die-${index}`,
        face: result as AttackDieFace,
      }));
    }

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

  const currentRollDefenseDiceCount = computed(() => {
    if (!currentGameState.value?.currentDefendingShipId) return 0;
    const allShips = [...player1Ships.value, ...player2Ships.value];
    const defendingShip = allShips.find(
      (s) => s.ship.shipId === currentGameState.value!.currentDefendingShipId
    );
    return defendingShip?.ship.agility || 0;
  });

  const currentDefenseDice = computed(() => {
    if (!gameData.value) return [];
    const currentStep = gameData.value.steps[selectedStepIndex.value];

    if (currentStep && currentStep.type === "modify_defense_dice") {
      return currentStep.afterResults.map((result, index) => ({
        id: `die-${index}`,
        face: result as DefenseDieFace,
      }));
    }

    if (
      currentStep &&
      currentStep.type === "roll_defense_dice" &&
      currentStep.results
    ) {
      return currentStep.results.map((result, index) => ({
        id: `die-${index}`,
        face: result as DefenseDieFace,
      }));
    }

    return [];
  });

  return {
    currentRollAttackDiceCount,
    currentAttackDice,
    currentRollDefenseDiceCount,
    currentDefenseDice,
  };
};

