import { CurrentGamePage } from "#shared/enums";
import type { CurrentGameState } from "#shared/game-state-dto";

export const useGameTransitions = (
  selectedStepIndex: Ref<number>,
  previousStepIndex: Ref<number>
) => {
  const currentUiScreen = ref<CurrentGamePage | null>(null);
  const previousUiScreen = ref<CurrentGamePage | null>(null);

  const transitionDirection = computed(() => {
    return selectedStepIndex.value > previousStepIndex.value
      ? "forward"
      : "backward";
  });

  const transitionName = computed(() => {
    const baseTransition =
      transitionDirection.value === "forward" ? "slide-up" : "slide-down";

    const previousScreen = previousUiScreen.value;
    const currentScreen = currentUiScreen.value;

    if (
      previousScreen === CurrentGamePage.RollAttackDice &&
      currentScreen === CurrentGamePage.ModifyAttackDice
    ) {
      return `${baseTransition}-no-enter-no-leave`;
    }

    if (
      previousScreen === CurrentGamePage.RollDefenseDice &&
      currentScreen === CurrentGamePage.ModifyDefenseDice
    ) {
      return `${baseTransition}-no-enter-no-leave`;
    }

    if (previousScreen === CurrentGamePage.RollAttackDice) {
      return `${baseTransition}-no-leave`;
    }

    if (previousScreen === CurrentGamePage.RollDefenseDice) {
      return `${baseTransition}-no-leave`;
    }

    return baseTransition;
  });

  const watchUiScreen = (currentGameState: Ref<CurrentGameState | null>) => {
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
  };

  return {
    transitionName,
    watchUiScreen,
  };
};

