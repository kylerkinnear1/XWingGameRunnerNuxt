import type { GameStepDto } from "#shared/game-state-dto";

export const useGameSteps = (gameId: string) => {
  const selectedStepIndex = ref(0);
  const previousStepIndex = ref(0);

  const selectStep = (index: number) => {
    previousStepIndex.value = selectedStepIndex.value;
    selectedStepIndex.value = index;
  };

  const addStep = async (
    step: GameStepDto,
    gameData: Ref<{ steps: GameStepDto[] } | null>,
    refreshCallback: () => Promise<void>
  ) => {
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

    await refreshCallback();

    if (gameData.value) {
      previousStepIndex.value = selectedStepIndex.value;
      selectedStepIndex.value = gameData.value.steps.length - 1;
    }
  };

  const moveToStepOrPush = async (
    stepType: GameStepDto["type"],
    step: GameStepDto,
    gameData: Ref<{ steps: GameStepDto[] } | null>,
    refreshCallback: () => Promise<void>
  ) => {
    if (!gameData.value) return;

    const currentIndex = selectedStepIndex.value;
    const nextIndex = currentIndex + 1;
    const nextStep = gameData.value.steps[nextIndex];

    if (nextStep && nextStep.type === stepType) {
      previousStepIndex.value = selectedStepIndex.value;
      selectedStepIndex.value = nextIndex;
      await refreshCallback();
    } else {
      await addStep(step, gameData, refreshCallback);
    }
  };

  const truncateSteps = async (afterIndex: number) => {
    await $fetch(`/api/games/${gameId}/steps/truncate`, {
      method: "POST",
      body: {
        afterIndex,
      },
    });
  };

  return {
    selectedStepIndex,
    previousStepIndex,
    selectStep,
    addStep,
    moveToStepOrPush,
    truncateSteps,
  };
};

