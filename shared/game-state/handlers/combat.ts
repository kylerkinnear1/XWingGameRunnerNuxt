import { CurrentGamePage, GamePhase } from "#shared/enums";
import type { SquadReadDto } from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  BeginCombat,
  BeginSelectTarget,
  SelectAttacker,
  SelectWeapon,
  SkipAttack,
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
  state.uiScreen = CurrentGamePage.CombatStart;
}

export function handleBeginSelectTarget(
  step: BeginSelectTarget,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.uiScreen = CurrentGamePage.SelectTarget;
}

export function handleSelectAttacker(
  step: SelectAttacker,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.currentAttackingShipId = step.shipId;
  state.uiScreen = CurrentGamePage.SelectWeapon;
}

export function handleSelectWeapon(
  step: SelectWeapon,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.currentAttackingShipId = step.attackerShipId;
  state.currentDefendingShipId = step.defenderShipId;
  state.uiScreen = CurrentGamePage.SelectWeapon;
}

export function handleSkipAttack(
  step: SkipAttack,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.currentAttackingShipId = null;
  state.currentDefendingShipId = null;
  state.uiScreen = CurrentGamePage.SelectTarget;
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

  state.uiScreen = CurrentGamePage.Engagement;
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

  state.currentAttackingShipId = null;
  state.currentDefendingShipId = null;
  state.uiScreen = CurrentGamePage.SelectTarget;
}
