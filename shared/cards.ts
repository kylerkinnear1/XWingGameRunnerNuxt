import type { Maneuver } from "#shared/enums";

export interface ShipDto {
  shipType: string;
  maneuvers: readonly Maneuver[];
}

export interface CardsDto {
  ships: ShipDto[];
  pilots: PilotDto[];
  upgrades: UpgradeDto[];
  damageCards: DamageCardDto[];
  damageDeck: readonly string[];
}

export interface PilotDto {
  id: string;
  factionKey: string;

  pilotName: string;
  faction: string;
  shipType: string;

  isUnique: boolean;
  pilotSkill: number;
  points: number;

  attack: number;
  agility: number;
  hull: number;
  shields: number;

  actions: readonly string[];
  upgradeSlots: readonly string[];

  ability?: string;
  cardImageUrl?: string;
  maneuvers: readonly Maneuver[];
}

export interface UpgradeDto {
  id: string;
  key: string;
  categoryKey: string;

  name: string;
  isUnique: boolean;
  rulesText: string;
  upgradeType: string;
  slotsRequired: readonly string[];
  points: number;

  restrictions?: {
    factions: readonly string[];
    ships: readonly string[];
    isLimited: boolean;
    isModification: boolean;
  };

  limited?: boolean;

  attack: number | null;
  minRange: number | null;
  maxRange: number | null;
  energy: number | null;

  cardImageUrl?: string;
}

export interface DamageCardDto {
  id: string;
  name: string;
  type: "Pilot" | "Ship";
  text: string;
  cardImageUrl?: string;
}
