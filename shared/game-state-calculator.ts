import type {
  Maneuver,
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
  PilotDto as SquadPilotDto,
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
} from "#shared/game-state-dto";

const calculateGameState = (
  gameState: GameStateDto,
  player1Squad: SquadReadDto,
  player2Squad: SquadReadDto
): CurrentGameState => {
  throw new Error("Not implemented");
};
