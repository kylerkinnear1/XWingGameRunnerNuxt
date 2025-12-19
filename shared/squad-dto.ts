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

export type SquadCreateDto = {
    name: string;
    faction: Faction;
}

export type SquadCreateResponseDto = {
    id: string;
    createdAt : Date;
    updatedAt: Date;
}