import './enums';
import type { Faction } from './enums';

export type SquadReadDto = {
    id :string;
    userId: string;
    name: string;
    faction: Faction;
    createdAt: Date;
    updatedAt: Date;
}

export type SquadReadResponseDto = {
    squads: SquadReadDto[];
}

export type SquadUpdateDto = {
    name: string;
    faction: Faction;
}

export type SquadUpdateResponseDto = {
    id: string;
    createdAt : Date;
    updatedAt: Date;
}