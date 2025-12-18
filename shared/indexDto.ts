export type SquadDto = {
    id :string;
    userId: string;
    name: string;
    faction: "rebel" | "scum" | "empire";
    createdAt: Date;
    updatedAt: Date;
}

export type IndexDto = {
    squads: SquadDto[];
}