import { ref } from "vue";

export interface DestroyShipParams {
  gameId: string;
  shipId: string;
  destroyedByShipId?: string;
  destroyedByAttack?: boolean;
  round: number;
}

export const useShipDestruction = () => {
  const isDestroying = ref(false);
  const error = ref<string | null>(null);

  const destroyShip = async (params: DestroyShipParams) => {
    isDestroying.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/games/destroyShip", {
        method: "POST",
        body: params,
      });

      return response;
    } catch (err: any) {
      console.error("Failed to destroy ship:", err);
      error.value = err.data?.message || "Failed to destroy ship";
      throw err;
    } finally {
      isDestroying.value = false;
    }
  };

  const repairShip = async (params: {
    gameId: string;
    shipId: string;
    round: number;
  }) => {
    // This would be implemented if you want undo functionality
    // For now, this is a placeholder for house rules or testing
    isDestroying.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/games/repairShip", {
        method: "POST",
        body: params,
      });

      return response;
    } catch (err: any) {
      console.error("Failed to repair ship:", err);
      error.value = err.data?.message || "Failed to repair ship";
      throw err;
    } finally {
      isDestroying.value = false;
    }
  };

  return {
    destroyShip,
    repairShip,
    isDestroying,
    error,
  };
};
