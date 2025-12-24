import type {
  SquadReadDto,
} from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import { TokenType } from "#shared/enums";
import type {
  CurrentGameState,
  AssignToken,
  SpendToken,
  TriggerAbility,
  SpendAmmo,
  ApplyDamage,
  ShipHalfHealth,
  AssignCrit,
  RemoveCrit,
  RemoveFacedownDamage,
  FlipCritFacedown,
  UpdatePilotSkill,
  UpdateAgility,
  UpdateAttack,
  DecreaseShields,
  FlipCrit,
  FlipUpgrade,
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
      
      const upgradeCard = cards.upgrades.find((u) => u.id === step.weaponId);
      const isAmmoUpgrade = upgradeCard && ["Torpedo", "Missile", "Bomb", "Mine"].includes(upgradeCard.upgradeType);
      
      if (isAmmoUpgrade && step.ammoRemaining >= 0) {
        const upgradesWithSameId = ship.upgrades.filter((u) => u.upgradeId === step.weaponId);
        const expectedDuplicates = step.ammoRemaining;
        const currentDuplicates = upgradesWithSameId.length - 1;
        
        if (currentDuplicates > expectedDuplicates) {
          const duplicatesToRemove = currentDuplicates - expectedDuplicates;
          let removed = 0;
          for (let i = ship.upgrades.length - 1; i >= 0 && removed < duplicatesToRemove; i--) {
            if (ship.upgrades[i].upgradeId === step.weaponId && ship.upgrades[i].faceUp) {
              const firstIndex = ship.upgrades.findIndex((u) => u.upgradeId === step.weaponId);
              if (i > firstIndex) {
                ship.upgrades.splice(i, 1);
                removed++;
              }
            }
          }
        }
      }
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
      ship.hull = Math.max(0, ship.hull - 1);
    } else {
      ship.faceUpDamage.push({
        critCardId: step.critCardId,
        faceUp: true,
      });
      ship.hull = Math.max(0, ship.hull - 1);
    }
  }
  state.currentStep += 1;
}

export function handleRemoveCrit(
  step: RemoveCrit,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    const index = ship.faceUpDamage.findIndex(
      (c) => c.critCardId === step.critCardId
    );
    if (index !== -1) {
      ship.faceUpDamage.splice(index, 1);
      const critCard = cards.damageCards.find((c) => c.id === step.critCardId);
      const isDirectHit = critCard?.id === "direct-hit";
      
      const squad = squads.find((s) =>
        s.ships.some((squadShip) => squadShip.id === ship.shipId)
      );
      const squadShip = squad?.ships.find((s) => s.id === ship.shipId);
      const pilot = squadShip ? cards.pilots.find((p) => p.id === squadShip.pilotId) : null;
      const totalHull = pilot?.hull || ship.hull;
      
      ship.hull = Math.min(ship.hull + 1, totalHull);
      
      if (isDirectHit && ship.faceDownDamage > 0) {
        ship.faceDownDamage -= 1;
        ship.hull = Math.min(ship.hull + 1, totalHull);
      }
    }
  }
  state.currentStep += 1;
}

export function handleRemoveFacedownDamage(
  step: RemoveFacedownDamage,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship && ship.faceDownDamage > 0) {
    ship.faceDownDamage -= 1;
    const squad = squads.find((s) =>
      s.ships.some((squadShip) => squadShip.id === ship.shipId)
    );
    const squadShip = squad?.ships.find((s) => s.id === ship.shipId);
    const pilot = squadShip ? cards.pilots.find((p) => p.id === squadShip.pilotId) : null;
    const totalHull = pilot?.hull || ship.hull;
    ship.hull = Math.min(ship.hull + 1, totalHull);
  }
  state.currentStep += 1;
}

export function handleFlipCritFacedown(
  step: FlipCritFacedown,
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
      crit.faceUp = false;
    }
  }
  state.currentStep += 1;
}

export function handleUpdatePilotSkill(
  step: UpdatePilotSkill,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.pilotSkill = step.newPilotSkill;
  }
  state.currentStep += 1;
}

export function handleUpdateAgility(
  step: UpdateAgility,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.agility = step.newAgility;
  }
  state.currentStep += 1;
}

export function handleUpdateAttack(
  step: UpdateAttack,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    ship.attack = step.newAttack;
  }
  state.currentStep += 1;
}

export function handleDecreaseShields(
  step: DecreaseShields,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship && ship.shields > 0) ship.shields -= 1;
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

export function handleFlipUpgrade(
  step: FlipUpgrade,
  state: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): void {
  const ship = state.ships.find((s) => s.shipId === step.shipId);
  if (ship) {
    const upgrade = ship.upgrades.find(
      (u) => u.upgradeId === step.upgradeId
    );
    if (upgrade) {
      upgrade.faceUp = step.faceUp;
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
    
    // Remove all target locks from the destroyed ship
    ship.tokens = ship.tokens.filter(
      (t) => t.tokenType !== TokenType.TargetLock
    );
    
    // Remove all target locks on the destroyed ship (from other ships)
    state.ships.forEach((otherShip) => {
      if (otherShip.shipId !== step.shipId) {
        otherShip.tokens = otherShip.tokens.filter(
          (t) =>
            t.tokenType !== TokenType.TargetLock ||
            t.targetShipId !== step.shipId
        );
      }
    });
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

