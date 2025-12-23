import type { TokenType } from "#shared/enums";
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
    conditionId?: string | null
  ) => {
    await addStep(
      {
        type: "assign_token",
        sourceShipId: shipId,
        tokenType,
        conditionId: conditionId ?? null,
        reinforceDirection: null,
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
    const ship = currentGameState.value?.ships.find((s) => s.shipId === shipId);
    if (!ship) return;

    const newHull = Math.max(0, ship.hull - 1);

    await addStep(
      {
        type: "apply_damage",
        shipId,
        hitsApplied: 1,
        critsApplied: 0,
        hullRemaining: newHull,
        shieldsRemaining: ship.shields,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

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

    const newHull = Math.min(ship.hull + 1, getTotalHull(shipId));

    await addStep(
      {
        type: "remove_facedown_damage",
        shipId,
        hullRemaining: newHull,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );
  };

  const assignCrit = async (shipId: string, critCardId: string) => {
    const ship = currentGameState.value?.ships.find((s) => s.shipId === shipId);
    if (!ship) return;

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

    const damageAmount = isDirectHit ? 2 : 1;
    const newHull = Math.max(0, ship.hull - damageAmount);

    await addStep(
      {
        type: "apply_damage",
        shipId,
        hitsApplied: 0,
        critsApplied: 1,
        hullRemaining: newHull,
        shieldsRemaining: ship.shields,
        timestamp: new Date(),
      },
      gameData,
      refreshCallback
    );

    if (isDirectHit) {
      await addFacedownDamage(shipId);
    }
  };

  const removeCrit = async (shipId: string, critCardId: string) => {
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

  const addStatModifier = async (
    shipId: string,
    stat: "hull" | "shields" | "agility" | "attack" | "pilotSkill",
    amount: number
  ) => {
    if (stat === "hull") {
      await addStep(
        { type: "increase_max_hull", shipId, timestamp: new Date() },
        gameData,
        refreshCallback
      );
    } else if (stat === "shields") {
      await addStep(
        {
          type: "increase_max_shields",
          shipId,
          timestamp: new Date(),
        },
        gameData,
        refreshCallback
      );
    } else if (stat === "pilotSkill") {
      const ship = currentGameState.value?.ships.find(
        (s) => s.shipId === shipId
      );
      if (!ship) return;
      await addStep(
        {
          type: "update_pilot_skill",
          shipId,
          newPilotSkill: ship.pilotSkill + amount,
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
    addStatModifier,
    decreaseHull,
    decreaseShields,
    flipUpgrade,
  };
};

