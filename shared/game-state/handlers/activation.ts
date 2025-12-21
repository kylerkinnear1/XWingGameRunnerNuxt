import { GamePhase } from "#shared/enums";
import type {
  SquadReadDto,
} from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  ActivationStep,
  BeginManeuver,
  CleanManeuver,
  Collide,
  StressCheck,
  PerformAction,
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

export function handleDetonateBomb(
  step: DetonateBomb,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

