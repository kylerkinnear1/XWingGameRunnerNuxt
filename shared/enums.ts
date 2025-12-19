export enum Faction {
    Rebel = 'rebel',
    Scum = 'scum',
    Empire = 'empire'
}

export const factionOptions = [
    { value: Faction.Rebel, label: 'Rebel Alliance' },
    { value: Faction.Scum, label: 'Scum and Villainy' },
    { value: Faction.Empire, label: 'Galactic Empire' }
] as const;