import type { Maneuver } from "#shared/enums";
import type { PilotDto, UpgradeDto, CardsDto } from "#shared/cards";
import type { ShipDto } from "#shared/squad-dto";

const WEAPON_UPGRADE_TYPES = [
  "Torpedo",
  "Missile",
  "Cannon",
  "Turret",
  "Bomb",
  "Mine",
];

const EXCLUDE_KEYS = ["renegaderefit", "extramunitions"];

export function createWeaponsForShip(
  ship: ShipDto,
  pilots: Record<string, PilotDto>,
  upgrades: Record<string, UpgradeDto>
) {
  const shipUpgradeObjs = ship.upgradeIds
    .map((id) => upgrades[id])
    .filter((u) => u !== undefined);

  const hasExtraMunitions = ship.upgradeIds.includes("extramunitions");

  const pilotCard = pilots[ship.pilotId];
  let pilotWeapons: any[] = [];
  if (
    pilotCard &&
    typeof pilotCard.attack === "number" &&
    pilotCard.attack > 0
  ) {
    pilotWeapons.push({
      weaponId: "pilot",
      type: "Primary",
      name: `${pilotCard.pilotName} Primary`,
      attack: pilotCard.attack,
      minRange: 1,
      maxRange: 3,
      ammo: null,
      isDestroyed: false,
    });
  }

  let upgradeWeapons: any[] = shipUpgradeObjs
    .filter(
      (u) =>
        WEAPON_UPGRADE_TYPES.includes(u.upgradeType) &&
        !EXCLUDE_KEYS.includes(u.key)
    )
    .map((u) => ({
      weaponId: u.id,
      type: u.upgradeType,
      name: u.name,
      attack: u.attack,
      minRange: u.minRange,
      maxRange: u.maxRange,
      ammo:
        u.energy !== null
          ? u.energy
          : ["Torpedo", "Missile", "Bomb", "Mine"].includes(u.upgradeType)
          ? 1
          : null,
      isDestroyed: false,
    }));

  if (shipUpgradeObjs.some((u) => u.key === "snapshot")) {
    const snap = shipUpgradeObjs.find((u) => u.key === "snapshot");
    upgradeWeapons.push({
      weaponId: snap?.id ?? "elite/snapshot",
      type: "Elite",
      name: snap?.name ?? "Snap Shot",
      attack: snap?.attack ?? 2,
      minRange: snap?.minRange ?? 2,
      maxRange: snap?.maxRange ?? 2,
      ammo: null,
      isDestroyed: false,
    });
  }

  if (shipUpgradeObjs.some((u) => u.key === "renegaderefit")) {
    const refit = shipUpgradeObjs.find((u) => u.key === "renegaderefit");
    upgradeWeapons.push({
      weaponId: refit?.id ?? "torpedo/renegaderefit",
      type: "Torpedo",
      name: refit?.name ?? "Renegade Refit",
      attack: refit?.attack ?? 2,
      minRange: refit?.minRange ?? 2,
      maxRange: refit?.maxRange ?? 3,
      ammo: 1,
      isDestroyed: false,
    });
  }

  if (hasExtraMunitions) {
    upgradeWeapons = upgradeWeapons.map((w) => {
      if (w.type === "Cannon" || w.type === "Elite") {
        return { ...w };
      }
      if (w.ammo !== null && typeof w.ammo === "number") {
        return { ...w, ammo: w.ammo + 1 };
      }
      return { ...w };
    });
  }

  return [...pilotWeapons, ...upgradeWeapons];
}

