import { GamePhase } from "#shared/enums";
import type {
  SquadReadDto,
} from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  Cleanup,
  TurnEnd,
  GameEnd,
} from "#shared/game-state-dto";

export function handleCleanup(
  step: Cleanup,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.End;
  state.currentStep += 1;
}

export function handleTurnEnd(
  step: TurnEnd,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.End;
  state.currentStep += 1;
}

export function handleGameEnd(
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

