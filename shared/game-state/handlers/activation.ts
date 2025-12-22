import { GamePhase, CurrentGamePage, CollisionType } from "#shared/enums";
import type { SquadReadDto } from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  ActivationStep,
  BeginManeuver,
  CleanManeuver,
  Collide,
  StressCheck,
  PerformAction,
  ActionSkipped,
  SelectActionAgain,
  DoneWithActions,
  DetonateBomb,
} from "#shared/game-state-dto";

export function handleActivationStep(
  step: ActivationStep,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Activation;
  state.currentStep += 1;
  state.uiScreen = CurrentGamePage.SelectActivation;
}

export function handleBeginManeuver(
  step: BeginManeuver,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.hasActivated = true;
  }

  state.currentActivatingShipId = step.shipId;
  state.uiScreen = CurrentGamePage.CollisionSelection;
}

export function handleCleanManeuver(
  step: CleanManeuver,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.didBump = false;
  }

  state.uiScreen = CurrentGamePage.ActionSelection;
}

export function handleCollide(
  step: Collide,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.collisions.push({
      collisionType: step.collisionType,
      shipId: step.shipId,
      landedOnObstacle: step.landedOnObstacle,
    });
  }

  if (step.collisionType === CollisionType.Ship) {
    state.currentActivatingShipId = null;
  }
}

export function handleStressCheck(
  step: StressCheck,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handlePerformAction(
  step: PerformAction,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handleActionSkipped(
  step: ActionSkipped,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  state.currentActivatingShipId = null;
}

export function handleSelectActionAgain(
  step: SelectActionAgain,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  state.currentActivatingShipId = step.shipId;
  state.uiScreen = CurrentGamePage.ActionSelection;
}

export function handleDoneWithActions(
  step: DoneWithActions,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  state.currentActivatingShipId = null;
}

export function handleDetonateBomb(
  step: DetonateBomb,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}
