import "./enums";
import type { Faction } from "./enums";

export type SquadReadDto = {
  id: string;
  userId: string;
  name: string;
  faction: Faction;
  createdAt: Date;
  updatedAt: Date;
  ships: ShipDto[];
};

export type SquadReadResponseDto = {
  squads: readonly SquadReadDto[];
};

export type SquadUpdateDto = {
  name: string;
  faction: Faction;
  ships: ShipDto[];
};

export type SquadUpdateResponseDto = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ShipDto = {
  id: string;
  pilotId: string;
  upgradeIds: string[];
};
