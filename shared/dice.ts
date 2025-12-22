export type AttackDieFace = "hit" | "crit" | "focus" | "blank";
export type DefenseDieFace = "evade" | "focus" | "blank";

export interface AttackDie {
  id: string;
  face: AttackDieFace;
}

export interface DefenseDie {
  id: string;
  face: DefenseDieFace;
}

export type DiceType = "attack" | "defense";

// Roll probabilities for attack dice
export const ATTACK_DICE_WEIGHTS: Record<AttackDieFace, number> = {
  hit: 3, // 37.5%
  crit: 1, // 12.5%
  focus: 2, // 25%
  blank: 2, // 25%
};

// Roll probabilities for defense dice
export const DEFENSE_DICE_WEIGHTS: Record<DefenseDieFace, number> = {
  evade: 3, // 37.5%
  focus: 2, // 25%
  blank: 3, // 37.5%
};

// X-Wing font icon mappings
export const ATTACK_DIE_ICONS: Record<AttackDieFace, string> = {
  hit: "d", // xwing-miniatures-font hit icon
  crit: "c", // xwing-miniatures-font crit icon
  focus: "f", // xwing-miniatures-font focus icon
  blank: "", // no icon for blank
};

export const DEFENSE_DIE_ICONS: Record<DefenseDieFace, string> = {
  evade: "e", // xwing-miniatures-font evade icon
  focus: "f", // xwing-miniatures-font focus icon
  blank: "", // no icon for blank
};
