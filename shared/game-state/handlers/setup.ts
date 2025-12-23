import { GamePhase, CurrentGamePage } from "#shared/enums";
import type { Maneuver } from "#shared/enums";
import type { SquadReadDto } from "#shared/squad-dto";
import type { CardsDto, PilotDto, UpgradeDto } from "#shared/cards";
import type {
  CurrentGameState,
  GameStartDto,
  BeginSelectInitiative,
  InitiativeSelected,
  StartSetup,
  PlaceObstacle,
  ShipPlaced,
  EndSetup,
  IncreaseMaxHull,
  IncreaseMaxShields,
  DecreaseMaxHull,
  DecreaseMaxShields,
  ModifyPilotSkill,
  ModifyAgility,
  ModifyAttack,
} from "#shared/game-state-dto";
import { createWeaponsForShip } from "../utils/weapon-factory";

export function handleGameStart(
  step: GameStartDto,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const pilots = cards.pilots.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, PilotDto>);

  const upgrades = cards.upgrades.reduce((acc, u) => {
    acc[u.id] = u;
    return acc;
  }, {} as Record<string, UpgradeDto>);

  const maneuvers = cards.pilots.reduce((acc, p) => {
    acc[p.id] = p.maneuvers;
    return acc;
  }, {} as Record<string, readonly Maneuver[]>);

  state.currentStep += 1;
  state.currentPhase = GamePhase.Start;
  state.uiScreen = CurrentGamePage.GameStart;
  state.player1Points = 0;
  state.player2Points = 0;
  state.bombIds = [];
  state.mineIds = [];
  state.obstacles = [];
  state.ships = squads.flatMap((squad) =>
    squad.ships.map((ship) => ({
      shipId: ship.id,
      pilotId: ship.pilotId,
      hull: pilots[ship.pilotId]?.hull || 0,
      shields: pilots[ship.pilotId]?.shields || 0,
      weapons: createWeaponsForShip(ship, pilots, upgrades),
      tokens: [],
      faceUpDamage: [],
      playerId: squad.userId,
      pilotSkill: pilots[ship.pilotId]?.pilotSkill || 0,
      attack: pilots[ship.pilotId]?.attack || 0,
      agility: pilots[ship.pilotId]?.agility || 0,
      maneuvers: maneuvers[ship.pilotId] || [],
      isPlaced: false,
      isDestroyed: false,
      dialAssigned: null,
      isHalfPointsScored: false,
      faceDownDamage: 0,
      upgrades: ship.upgradeIds.map((id) => ({
        upgradeId: id,
        faceUp: true,
      })),
      hasActivated: false,
      didBump: false,
      collisions: [],
      attackTargetShipId: null,
      hasAttacked: false,
    }))
  );
  state.playerWithInitiative = null;
  state.totalTurns = 0;
}

export function handleIncreaseMaxHull(
  step: IncreaseMaxHull,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;

  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.hull += 1;
  }
}

export function handleIncreaseMaxShields(
  step: IncreaseMaxShields,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.shields += 1;
  }
}

export function handleDecreaseMaxHull(
  step: DecreaseMaxHull,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.hull = Math.max(0, ship.hull - 1);
  }
}

export function handleDecreaseMaxShields(
  step: DecreaseMaxShields,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.shields = Math.max(0, ship.shields - 1);
  }
}

export function handleModifyPilotSkill(
  step: ModifyPilotSkill,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.pilotSkill = step.newValue;
  }
}

export function handleModifyAgility(
  step: ModifyAgility,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.agility = step.newValue;
  }
}

export function handleModifyAttack(
  step: ModifyAttack,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.attack = step.newValue;
  }
}

export function handleBeginSelectInitiative(
  step: BeginSelectInitiative,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.uiScreen = CurrentGamePage.SelectInitiative;
}

export function handleInitiativeSelected(
  step: InitiativeSelected,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.playerWithInitiative = step.playerWithInitiative;
}

export function handleStartSetup(
  step: StartSetup,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentPhase = GamePhase.Setup;
  state.currentStep += 1;
  state.uiScreen = CurrentGamePage.Setup;
}

export function handlePlaceObstacle(
  step: PlaceObstacle,
  currentState: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  currentState.obstacles.push({
    obstacleId: step.obstacleId,
    isDestroyed: false,
  });
}

export function handleShipPlaced(
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

  state.uiScreen = CurrentGamePage.Setup;
}

export function handleEndSetup(
  step: EndSetup,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
  state.uiScreen = CurrentGamePage.TurnStart;
}
