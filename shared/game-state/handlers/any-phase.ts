import type {
  SquadReadDto,
} from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  CurrentGameState,
  AssignToken,
  SpendToken,
  TriggerAbility,
  SpendAmmo,
  ApplyDamage,
  ShipHalfHealth,
  AssignCrit,
  FlipCrit,
  DestroyShip,
  DestroyObstacle,
} from "#shared/game-state-dto";

export function handleAssignToken(
  step: AssignToken,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.sourceShipId);
  if (ship) {
    ship.tokens.push({
      tokenType: step.tokenType,
      conditionId: step.conditionId,
      reinforceDirection: step.reinforceDirection,
      sourceShipId: step.sourceShipId,
      targetShipId: step.targetShipId,
    });
  }
  state.currentStep += 1;
}

export function handleSpendToken(
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

export function handleTriggerAbility(
  step: TriggerAbility,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  state.currentStep += 1;
}

export function handleSpendAmmo(
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

export function handleApplyDamage(
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

export function handleShipHalfHealth(
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

export function handleAssignCrit(
  step: AssignCrit,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    if (step.critCardId === "facedown") {
      ship.faceDownDamage += 1;
    } else {
      ship.faceUpDamage.push({
        critCardId: step.critCardId,
        faceUp: true,
      });
    }
  }
  state.currentStep += 1;
}

export function handleFlipCrit(
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

export function handleDestroyShip(
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

export function handleDestroyObstacle(
  step: DestroyObstacle,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const obstacle = state.obstacles.find(
    (o) => o.obstacleId === step.obstacleId
  );
  if (obstacle) {
    obstacle.isDestroyed = true;
  }
  state.currentStep += 1;
}

