import { GamePhase, CurrentGamePage } from "#shared/enums";
import type { SquadReadDto } from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  TurnStart,
  Planning,
  PlanningComplete,
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
  state.uiScreen = CurrentGamePage.TurnStart;

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
  state.uiScreen = CurrentGamePage.Planning;
}

export function handlePlanningComplete(
  step: PlanningComplete,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  Object.entries(step.dials).forEach(([shipId, maneuver]) => {
    const ship = state.ships.find((s) => s.shipId === shipId);
    if (ship) {

      if (!maneuver) {
        console.error(`"No maneuver found for ship ${shipId}`);
      }
      console.info(`Maneuver found for ship ${shipId}.`);
      ship.dialAssigned = maneuver;
    }
    else {
      console.error("Here's the issue...");
    }
  });
  state.currentStep += 1;
  state.uiScreen = CurrentGamePage.Planning;
}
