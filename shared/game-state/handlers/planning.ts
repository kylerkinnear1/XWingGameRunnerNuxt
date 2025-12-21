import { GamePhase } from "#shared/enums";
import type {
  SquadReadDto,
} from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  TurnStart,
  Planning,
  AssignDial,
} from "#shared/game-state-dto";

export function handleTurnStart(
  step: TurnStart,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.totalTurns += 1;
  state.currentPhase = GamePhase.Planning;
  state.currentStep += 1;

  for (const ship of state.ships) {
    ship.dialAssigned = null;
    ship.hasActivated = false;
    ship.collisions = [];
    ship.dialAssigned = null;
    ship.attackTargetShipId = null;
    ship.hasAttacked = false;
  }
}

export function handlePlanning(
  step: Planning,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handleAssignDial(
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

