export interface CardsDto {
    pilots: PilotDto[];
    upgrades: UpgradeDto[];
  }
  
  export interface PilotDto {
    id: string;
    key: string;
    factionKey: string;
    shipKey: string;
  
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
  
    actions: string[];
    upgradeSlots: string[];
  
    ability?: string;
    cardImageUrl?: string;
  }
  
  export interface UpgradeDto {
    id: string;
    key: string;
    categoryKey: string;
  
    name: string;
    isUnique: boolean;
    rulesText: string;
    upgradeType: string;
    slotsRequired: string[];
    points: number;
  
    restrictions?: {
      factions: string[];
      ships: string[];
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