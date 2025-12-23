import type { TokenType } from "#shared/enums";
import type { ReinforceDirection } from "#shared/enums";
import type { GameStepDto } from "#shared/game-state-dto";
import type { CurrentGameState } from "#shared/game-state-dto";
import type { CardsDto } from "#shared/cards";

export const useGameActions = (
  addStep: (
    step: GameStepDto,
    gameData: Ref<{ steps: GameStepDto[] } | null>,
    refreshCallback: () => Promise<void>
  ) => Promise<void>,
  gameData: Ref<{ steps: GameStepDto[] } | null>,
  currentGameState: Ref<CurrentGameState | null>,
  cards: Ref<CardsDto | null>,
  refreshCallback: () => Promise<void>,
  getTotalHull: (shipId: string) => number
) => {
  const addToken = async (
    shipId: string,
    tokenType: TokenType,
    targetShipId?: string | null,
    conditionId?: string | null,
    reinforceDirection?: ReinforceDirection | null
  ) => {
    await addStep(
      {
        type: "assign_token",
        sourceShipId: shipId,
        tokenType,
        conditionId: conditionId ?? null,
        reinforceDirection: reinforceDirection ?? null,
        targetShipId: targetShipId ?? null,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const removeToken = async (shipId: string, tokenType: TokenType) => {
    await addStep(
      {
        type: "spend_token",
        shipId,
        tokenType,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const addFacedownDamage = async (shipId: string) => {
    await addStep(
      {
        type: "assign_crit",
        shipId,
        critCardId: "facedown",
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const removeFacedownDamage = async (shipId: string) => {
    const ship = currentGameState.value?.ships.find((s) => s.shipId === shipId);
    if (!ship || ship.faceDownDamage === 0) return;

    await addStep(
      {
        type: "remove_facedown_damage",
        shipId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const assignCrit = async (shipId: string, critCardId: string) => {
    await addStep(
      {
        type: "assign_crit",
        shipId,
        critCardId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    const critCard = cards.value?.damageCards.find((c) => c.id === critCardId);
    const isDirectHit = critCard?.id === "direct-hit";

    if (isDirectHit) {
      await addFacedownDamage(shipId);
    }
  };

  const removeCrit = async (shipId: string, critCardId: string) => {
    const critCard = cards.value?.damageCards.find((c) => c.id === critCardId);
    const isDirectHit = critCard?.id === "direct-hit";

    await addStep(
      {
        type: "remove_crit",
        shipId,
        critCardId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    if (isDirectHit) {
      await removeFacedownDamage(shipId);
    }
  };

  const flipCritFacedown = async (shipId: string, critCardId: string) => {
    await addStep(
      {
        type: "flip_crit_facedown",
        shipId,
        critCardId,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const flipCritFaceup = async (shipId: string, critCardId: string) => {
    await addStep(
      {
        type: "flip_crit",
        shipId,
        critCardId,
        faceUp: true,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const addStatModifier = async (
    shipId: string,
    stat: "hull" | "shields" | "agility" | "attack" | "pilotSkill",
    amount: number
  ) => {
    const ship = currentGameState.value?.ships.find(
      (s) => s.shipId === shipId
    );
    if (!ship) return;

    if (stat === "hull") {
      if (amount > 0) {
        await addStep(
          { type: "increase_max_hull", shipId, timestamp: new Date() },
          gameData,
          refreshCallback
        );
      }
    } else if (stat === "shields") {
      if (amount > 0) {
        await addStep(
          {
            type: "increase_max_shields",
            shipId,
            timestamp: new Date(),
          },
          gameData,
          refreshCallback
        );
      }
    } else if (stat === "pilotSkill") {
      const newPilotSkill = Math.max(0, ship.pilotSkill + amount);
      await addStep(
        {
          type: "update_pilot_skill",
          shipId,
          newPilotSkill,
          timestamp: new Date(),
        },
        gameData,
        refreshCallback
      );
    } else if (stat === "agility") {
      const newAgility = Math.max(0, ship.agility + amount);
      await addStep(
        {
          type: "update_agility",
          shipId,
          newAgility,
          timestamp: new Date(),
        },
        gameData,
        refreshCallback
      );
    } else if (stat === "attack") {
      const newAttack = Math.max(0, ship.attack + amount);
      await addStep(
        {
          type: "update_attack",
          shipId,
          newAttack,
          timestamp: new Date(),
        },
        gameData,
        refreshCallback
      );
    }
  };

  const decreaseHull = async (shipId: string) => {
    await addFacedownDamage(shipId);
  };

  const decreaseShields = async (shipId: string) => {
    await addStep(
      { type: "decrease_shields", shipId, timestamp: new Date() },
      gameData,
      refreshCallback
    );
  };

  const flipUpgrade = async (
    shipId: string,
    upgradeId: string,
    faceUp: boolean
  ) => {
    await addStep(
      {
        type: "flip_upgrade",
        shipId,
        upgradeId,
        faceUp,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  return {
    addToken,
    removeToken,
    addFacedownDamage,
    removeFacedownDamage,
    assignCrit,
    removeCrit,
    flipCritFacedown,
    flipCritFaceup,
    addStatModifier,
    decreaseHull,
    decreaseShields,
    flipUpgrade,
  };
};

