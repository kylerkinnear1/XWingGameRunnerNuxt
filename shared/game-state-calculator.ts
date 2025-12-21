import type { Maneuver } from "#shared/enums";
import {
  TokenType,
  ActionType,
  DiceResult,
  CollisionType,
  ReinforceDirection,
  GamePhase,
} from "#shared/enums";
import type {
  SquadReadDto,
  SquadReadResponseDto,
  SquadUpdateDto,
  SquadUpdateResponseDto,
  ShipDto,
} from "#shared/squad-dto";
import type {
  CardsDto,
  PilotDto as CardPilotDto,
  UpgradeDto,
} from "#shared/cards";
import type {
  GameStateDto,
  CurrentGameState,
  ShipStateDto,
  CritStateDto,
  TokenStateDto,
  WeaponStateDto,
  GameStepDto,
  GameStartDto,
  SelectInitiative,
  StartSetup,
  ShipPlaced,
  EndSetup,
  TurnStart,
  Planning,
  AssignDial,
  ActivationStep,
  BeginManeuver,
  CleanManeuver,
  Collide,
  StressCheck,
  PerformAction,
  DetonateBomb,
  DestroyObstacle,
  AssignToken,
  SpendToken,
  AssignCondition,
  TriggerAbility,
  CombatStep,
  DeclareTarget,
  RollAttackDice,
  ModifyAttackDice,
  RollDefenseDice,
  ModifyDefenseDice,
  SpendAmmo,
  ApplyDamage,
  ShipHalfHealth,
  AssignCrit,
  FlipCrit,
  DestroyShip,
  AttackerComplete,
  Cleanup,
  TurnEnd,
  GameEnd,
} from "#shared/game-state-dto";

export const calculateGameState = (
  gameState: GameStateDto,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): CurrentGameState => {
  const currentState: CurrentGameState = {
    currentStep: 0,
    ships: [],
    playerWithInitiative: "",
    bombIds: [],
    mineIds: [],
    obstacleIds: [],
    player1Points: 0,
    player2Points: 0,
    totalTurns: 0,
    currentPhase: GamePhase.Start,
  };

  for (const step of gameState.steps) {
    switch (step.type) {
      case "game_start":
        handleGameStart(step, currentState, squads, cards);
        break;
      case "select_initiative":
        handleSelectInitiative(step, currentState, squads, cards);
        break;
      case "start_setup":
        handleStartSetup(step, currentState, squads, cards);
        break;
      case "ship_placed":
        handleShipPlaced(step, currentState, squads, cards);
        break;
      case "end_setup":
        handleEndSetup(step, currentState, squads, cards);
        break;
      case "turn_start":
        handleTurnStart(step, currentState, squads, cards);
        break;
      case "planning":
        handlePlanning(step, currentState, squads, cards);
        break;
      case "assign_dial":
        handleAssignDial(step, currentState, squads, cards);
        break;
      case "activation_step":
        handleActivationStep(step, currentState, squads, cards);
        break;
      case "begin_maneuver":
        handleBeginManeuver(step, currentState, squads, cards);
        break;
      case "clean_maneuver":
        handleCleanManeuver(step, currentState, squads, cards);
        break;
      case "collide":
        handleCollide(step, currentState, squads, cards);
        break;
      case "stress_check":
        handleStressCheck(step, currentState, squads, cards);
        break;
      case "perform_action":
        handlePerformAction(step, currentState, squads, cards);
        break;
      case "detonate_bomb":
        handleDetonateBomb(step, currentState, squads, cards);
        break;
      case "destroy_obstacle":
        handleDestroyObstacle(step, currentState, squads, cards);
        break;
      case "assign_token":
        handleAssignToken(step, currentState, squads, cards);
        break;
      case "spend_token":
        handleSpendToken(step, currentState, squads, cards);
        break;
      case "assign_condition":
        handleAssignCondition(step, currentState, squads, cards);
        break;
      case "trigger_ability":
        handleTriggerAbility(step, currentState, squads, cards);
        break;
      case "combat_step":
        handleCombatStep(step, currentState, squads, cards);
        break;
      case "declare_target":
        handleDeclareTarget(step, currentState, squads, cards);
        break;
      case "roll_attack_dice":
        handleRollAttackDice(step, currentState, squads, cards);
        break;
      case "modify_attack_dice":
        handleModifyAttackDice(step, currentState, squads, cards);
        break;
      case "roll_defense_dice":
        handleRollDefenseDice(step, currentState, squads, cards);
        break;
      case "modify_defense_dice":
        handleModifyDefenseDice(step, currentState, squads, cards);
        break;
      case "spend_ammo":
        handleSpendAmmo(step, currentState, squads, cards);
        break;
      case "apply_damage":
        handleApplyDamage(step, currentState, squads, cards);
        break;
      case "ship_half_health":
        handleShipHalfHealth(step, currentState, squads, cards);
        break;
      case "assign_crit":
        handleAssignCrit(step, currentState, squads, cards);
        break;
      case "flip_crit":
        handleFlipCrit(step, currentState, squads, cards);
        break;
      case "destroy_ship":
        handleDestroyShip(step, currentState, squads, cards);
        break;
      case "attacker_complete":
        handleAttackerComplete(step, currentState, squads, cards);
        break;
      case "cleanup":
        handleCleanup(step, currentState, squads, cards);
        break;
      case "turn_end":
        handleTurnEnd(step, currentState, squads, cards);
        break;
      case "game_end":
        handleGameEnd(step, currentState, squads, cards);
        break;
    }
  }

  return currentState;
};

// Step handler functions
function handleGameStart(
  step: GameStartDto,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.currentPhase = GamePhase.Start;
  state.player1Points = 0;
  state.player2Points = 0;
  state.bombIds = [];
  state.mineIds = [];
  state.obstacleIds = [];
  state.ships = squads.flatMap((squad) =>
    squad.ships.map((ship) => ({
      shipId: ship.id,
      pilotId: ship.pilotId,
      hull: 0,
      shields: 0,
      weapons: [], // TODO: for snapshot, torpedos, turrets, missiles, bombs, mines (conner net, cluster mines, proximity mines, rigged cargo chute), cannons
      tokens: [],
      faceUpDamage: [],
      playerId: squad.userId,
      pilotSkill: 0, // TODO: map
      attack: 0, // TODO: map
      agility: 0, // TODO: map
      maneuvers: [], // TODO: map
      isPlaced: false,
      isDestroyed: false,
      dialAssigned: null,
      isHalfPointsScored: false,
      faceDownDamage: 0,
      upgrades: [], // TODO: map
      hasActivated: false,
    }))
  );
  state.playerWithInitiative = null;
  state.totalTurns = 0;
}

function handleSelectInitiative(
  step: SelectInitiative,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.playerWithInitiative = step.playerWithInitiative;
  state.currentStep += 1;
  state.currentPhase = GamePhase.Start;
  state.player1Points = 0;
  state.player2Points = 0;
  state.bombIds = [];
  state.mineIds = [];
  state.obstacleIds = [];
  state.ships = [];
  state.playerWithInitiative = null;
  state.totalTurns = 0;
}

function handleStartSetup(
  step: StartSetup,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Setup;
  state.currentStep += 1;
}

function handleShipPlaced(
  step: ShipPlaced,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.isPlaced = true;
  }
  state.currentStep += 1;
}

function handleEndSetup(
  step: EndSetup,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Planning;
  state.currentStep += 1;
}

function handleTurnStart(
  step: TurnStart,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.totalTurns += 1;
  state.currentPhase = GamePhase.Planning;
  state.currentStep += 1;
}

function handlePlanning(
  step: Planning,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Planning;
  state.currentStep += 1;
}

function handleAssignDial(
  step: AssignDial,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.dialAssigned = step.maneuver;
  }
  state.currentStep += 1;
}

function handleActivationStep(
  step: ActivationStep,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Activation;
  state.currentStep += 1;
}

function handleBeginManeuver(
  step: BeginManeuver,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleCleanManeuver(
  step: CleanManeuver,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleCollide(
  step: Collide,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleStressCheck(
  step: StressCheck,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handlePerformAction(
  step: PerformAction,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleDetonateBomb(
  step: DetonateBomb,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleDestroyObstacle(
  step: DestroyObstacle,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.obstacleIds = state.obstacleIds.filter((id) => id !== step.obstacleId);
  state.currentStep += 1;
}

function handleAssignToken(
  step: AssignToken,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.tokens.push({
      tokenType: step.tokenType,
      conditionId: null,
      reinforceDirection: null,
      sourceShipId: step.targetShipId || null,
    });
  }
  state.currentStep += 1;
}

function handleSpendToken(
  step: SpendToken,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    const tokenIndex = ship.tokens.findIndex(
      (t) => t.tokenType === step.tokenType
    );
    if (tokenIndex >= 0) {
      ship.tokens.splice(tokenIndex, 1);
    }
  }
  state.currentStep += 1;
}

function handleAssignCondition(
  step: AssignCondition,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.tokens.push({
      tokenType: TokenType.Condition,
      conditionId: step.conditionId,
      reinforceDirection: null,
      sourceShipId: null,
    });
  }
  state.currentStep += 1;
}

function handleTriggerAbility(
  step: TriggerAbility,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleCombatStep(
  step: CombatStep,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Engagement;
  state.currentStep += 1;
}

function handleDeclareTarget(
  step: DeclareTarget,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleRollAttackDice(
  step: RollAttackDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleModifyAttackDice(
  step: ModifyAttackDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleRollDefenseDice(
  step: RollDefenseDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleModifyDefenseDice(
  step: ModifyDefenseDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleSpendAmmo(
  step: SpendAmmo,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    const weapon = ship.weapons.find((w) => w.weaponId === step.weaponId);
    if (weapon) {
      weapon.ammo = step.ammoRemaining;
    }
  }
  state.currentStep += 1;
}

function handleApplyDamage(
  step: ApplyDamage,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.shields = step.shieldsRemaining;
    ship.hull = step.hullRemaining;
  }
  state.currentStep += 1;
}

function handleShipHalfHealth(
  step: ShipHalfHealth,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.isHalfPointsScored = true;
  }
  state.currentStep += 1;
}

function handleAssignCrit(
  step: AssignCrit,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.faceUpDamage.push({
      critCardId: step.critCardId,
      faceUp: true,
    });
  }
  state.currentStep += 1;
}

function handleFlipCrit(
  step: FlipCrit,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    const crit = ship.faceUpDamage.find(
      (c) => c.critCardId === step.critCardId
    );
    if (crit) {
      crit.faceUp = step.faceUp;
    }
  }
  state.currentStep += 1;
}

function handleDestroyShip(
  step: DestroyShip,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.isDestroyed = true;
  }
  state.currentStep += 1;
}

function handleAttackerComplete(
  step: AttackerComplete,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

function handleCleanup(
  step: Cleanup,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  // Remove tokens as specified
  for (const [shipId, tokenTypes] of Object.entries(step.tokensRemoved)) {
    const ship = state.ships.find((s) => s.shipId === shipId);
    if (ship) {
      ship.tokens = ship.tokens.filter(
        (t) => !tokenTypes.includes(t.tokenType)
      );
    }
  }
  state.currentPhase = GamePhase.End;
  state.currentStep += 1;
}

function handleTurnEnd(
  step: TurnEnd,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.End;
  state.currentStep += 1;
}

function handleGameEnd(
  step: GameEnd,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.player1Points = step.player1Points;
  state.player2Points = step.player2Points;
  state.totalTurns = step.totalTurns;
  state.currentPhase = GamePhase.End;
  state.currentStep += 1;
}
