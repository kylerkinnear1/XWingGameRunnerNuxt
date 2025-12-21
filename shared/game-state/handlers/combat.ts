import { GamePhase } from "#shared/enums";
import type {
  SquadReadDto,
} from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  BeginCombat,
  DeclareTarget,
  RollAttackDice,
  ModifyAttackDice,
  RollDefenseDice,
  ModifyDefenseDice,
  CompleteAttack,
} from "#shared/game-state-dto";

export function handleCombatStep(
  step: BeginCombat,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Engagement;
  state.currentStep += 1;
}

export function handleDeclareTarget(
  step: DeclareTarget,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  const ship = state.ships.find((s) => s.shipId === step.attackerShipId);
  if (ship) {
    ship.attackTargetShipId = step.defenderShipId;
  }
}

export function handleRollAttackDice(
  step: RollAttackDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handleModifyAttackDice(
  step: ModifyAttackDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handleRollDefenseDice(
  step: RollDefenseDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handleModifyDefenseDice(
  step: ModifyDefenseDice,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handleCompleteAttack(
  step: CompleteAttack,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  const ship = state.ships.find((s) => s.shipId === step.attackerShipId);
  if (ship) {
    ship.hasAttacked = true;
  }
}

