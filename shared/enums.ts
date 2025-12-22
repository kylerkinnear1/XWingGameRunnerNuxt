export enum Faction {
  Rebel = "rebel",
  Scum = "scum",
  Empire = "empire",
}

export const factionOptions = [
  { value: Faction.Rebel, label: "Rebel Alliance" },
  { value: Faction.Scum, label: "Scum and Villainy" },
  { value: Faction.Empire, label: "Galactic Empire" },
] as const;

export enum Bearing {
  Straight = "straight",
  BankLeft = "bank-left",
  BankRight = "bank-right",
  TurnLeft = "turn-left",
  TurnRight = "turn-right",
  KTurn = "k-turn",
  SloopLeft = "sloop-left",
  SloopRight = "sloop-right",
  TallonRollLeft = "tallon-roll-left",
  TallonRollRight = "tallon-roll-right",
  Stationary = "stationary",
  Reverse = "reverse",
}

export enum ManeuverDifficulty {
  Green = "green",
  White = "white",
  Red = "red",
}

export enum TokenType {
  Focus = "focus",
  Evade = "evade",
  Stress = "stress",
  Ion = "ion",
  TargetLock = "target-lock",
  Reinforce = "reinforce",
  Cloak = "cloak",
  Jam = "jam",
  Calculate = "calculate",
  Charge = "charge",
  Force = "force",
  Disarm = "disarm",
  Tractor = "tractor",
  Strain = "strain",
  Deplete = "deplete",
  Shield = "shield",
  Energy = "energy",
  WeaponsDisabled = "weapons-disabled",
  Condition = "condition",
}

export enum ActionType {
  Focus = "focus",
  Evade = "evade",
  TargetLock = "target-lock",
  BarrelRoll = "barrel-roll",
  Boost = "boost",
  Reinforce = "reinforce",
  Coordinate = "coordinate",
  Jam = "jam",
  Calculate = "calculate",
  Cloak = "cloak",
  SLAM = "slam",
  Reload = "reload",
  RotateArc = "rotate-arc",
  Card = "card",
}

export enum DiceResult {
  Hit = "hit",
  Crit = "crit",
  Focus = "focus",
  Evade = "evade",
  Blank = "blank",
}

export enum CollisionType {
  Asteroid = "asteroid",
  Debris = "debris",
  GasCloud = "gas-cloud",
  Mine = "mine",
  Ship = "ship",
}

export enum ReinforceDirection {
  Front = "front",
  Back = "back",
}

export enum GamePhase {
  Start = "start",
  Setup = "setup",
  Planning = "planning",
  Activation = "activation",
  Engagement = "engagement",
  End = "end",
}

export enum CurrentGamePage {
  GameStart = "game-start",
  SelectInitiative = "select-initiative",
  Setup = "setup",
  TurnStart = "turn-start",
  Planning = "planning",
  SelectActivation = "select-activation",
  CollisionSelection = "collision-selection",
  ActionSelection = "action-selection",
  Engagement = "engagement",
  CombatStart = "combat-start",
  SelectTarget = "select-target",
  SelectWeapon = "select-weapon",
  RollAttackDice = "roll-attack-dice",
  ModifyAttackDice = "modify-attack-dice",
  RollDefenseDice = "roll-defense-dice",
  End = "end",
}

// Maneuver helper type
export interface Maneuver {
  bearing: Bearing;
  speed: number;
  difficulty: ManeuverDifficulty;
}
