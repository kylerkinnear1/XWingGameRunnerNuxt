import type { GameStateDto, CurrentGameState } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import { calculateGameState } from "#shared/game-state/calculator";

export const useGameState = (
  gameData: Ref<GameStateDto | null>,
  squads: Ref<SquadReadDto[]>,
  cards: Ref<CardsDto | null>,
  selectedStepIndex: Ref<number>
) => {
  const currentGameState = computed(() => {
    if (!gameData.value || !cards.value || !squads.value.length) return null;

    const partialGameState: GameStateDto = {
      ...gameData.value,
      steps: gameData.value.steps.slice(0, selectedStepIndex.value + 1),
    };

    return calculateGameState(partialGameState, squads.value, {
      pilots: [...cards.value.pilots],
      upgrades: [...cards.value.upgrades],
      damageCards: [...cards.value.damageCards],
      damageDeck: [...cards.value.damageDeck],
    });
  });

  return {
    currentGameState,
  };
};

