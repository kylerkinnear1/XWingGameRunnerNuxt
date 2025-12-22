// shared/game-steps.ts
import {
  TokenType,
  ActionType,
  DiceResult,
  CollisionType,
  ReinforceDirection,
  GamePhase,
} from "./enums";

import type { CurrentGamePage, Maneuver } from "./enums";

export type GameStateDto = {
  id: string;
  player1Id: string;
  player2Id: string;
  player1SquadId: string;
  player2SquadId: string;
  steps: GameStepDto[];
  createdAt: Date;
  updatedAt: Date;
};

export type CurrentGameState = {
  currentStep: number;
  ships: ShipStateDto[];
  playerWithInitiative: string | null;
  bombIds: string[];
  mineIds: string[];
  obstacles: ObstacleStateDto[];
  player1Points: number;
  player2Points: number;
  totalTurns: number;
  currentPhase: GamePhase;

  uiScreen: CurrentGamePage;
  currentActivatingShipId: string | null;
};

export type ObstacleStateDto = {
  obstacleId: string;
  isDestroyed: boolean;
};

export type ShipStateDto = {
  playerId: string;
  shipId: string;
  pilotSkill: number;
  hull: number;
  shields: number;
  attack: number;
  agility: number;
  maneuvers: readonly Maneuver[];
  tokens: TokenStateDto[];
  faceUpDamage: CritStateDto[];
  faceDownDamage: number;
  weapons: readonly WeaponStateDto[];
  upgrades: readonly UpgradeStateDto[];
  isPlaced: boolean;
  isDestroyed: boolean;
  didBump: boolean;
  dialAssigned: Maneuver | null;
  isHalfPointsScored: boolean;
  hasActivated: boolean;
  collisions: CollisionStateDto[];
  attackTargetShipId: string | null;
  hasAttacked: boolean;
};

export type UpgradeStateDto = {
  upgradeId: string;
  faceUp: boolean;
};

export type CritStateDto = {
  critCardId: string;
  faceUp: boolean;
};

export type CollisionStateDto = {
  collisionType: CollisionType;
  shipId: string;
  landedOnObstacle: boolean;
};

export type TokenStateDto = {
  tokenType: TokenType;
  conditionId: string | null;
  reinforceDirection: ReinforceDirection | null;
  sourceShipId: string | null;
  targetShipId: string | null;
};

export type WeaponStateDto = {
  weaponId: string;
  isDestroyed: boolean;
  ammo: number;
};

export type GameStepDto =
  | GameStartDto
  | IncreaseMaxHull
  | IncreaseMaxShields
  | BeginSelectInitiative
  | InitiativeSelected
  | StartSetup
  | PlaceObstacle
  | ShipPlaced
  | EndSetup
  | TurnStart
  | Planning
  | PlanningComplete
  | ActivationStep
  | BeginManeuver
  | CleanManeuver
  | Collide
  | StressCheck
  | PerformAction
  | ActionSkipped
  | SelectActionAgain
  | DoneWithActions
  | DetonateBomb
  | DestroyObstacle
  | AssignToken
  | TriggerAbility
  | BeginCombat
  | BeginSelectTarget
  | DeclareTarget
  | RollAttackDice
  | ModifyAttackDice
  | RollDefenseDice
  | ModifyDefenseDice
  | CompleteAttack
  | FlipUpgrade
  | SpendAmmo
  | ApplyDamage
  | ShipHalfHealth
  | DestroyShip
  | AssignCrit
  | FlipCrit
  | SpendToken
  | Cleanup
  | TurnEnd
  | GameEnd;

export interface GameStartDto {
  type: "game_start";
  timestamp: Date;
}

export interface IncreaseMaxHull {
  type: "increase_max_hull";
  shipId: string;
  timestamp: Date;
}

export interface IncreaseMaxShields {
  type: "increase_max_shields";
  shipId: string;
  timestamp: Date;
}

// Setup Phase
export interface BeginSelectInitiative {
  type: "begin_select_initiative";
  timestamp: Date;
}

export interface InitiativeSelected {
  type: "initiative_selected";
  playerWithInitiative: string;
  timestamp: Date;
}

export interface StartSetup {
  type: "start_setup";
  timestamp: Date;
}

export interface PlaceObstacle {
  type: "place_obstacle";
  obstacleId: string;
  timestamp: Date;
}

export interface ShipPlaced {
  type: "ship_placed";
  shipId: string;
  timestamp: Date;
}

export interface EndSetup {
  type: "end_setup";
  timestamp: Date;
}

// Turn Flow
export interface TurnStart {
  type: "turn_start";
  timestamp: Date;
}

export interface Planning {
  type: "planning";
  timestamp: Date;
}

export interface TurnEnd {
  type: "turn_end";
  timestamp: Date;
}

export interface GameEnd {
  type: "game_end";
  winnerId: string | null;
  player1Points: number;
  player2Points: number;
  totalTurns: number;
  timestamp: Date;
}

export interface PlanningComplete {
  type: "planning_complete";
  dials: Record<string, Maneuver>;
  timestamp: Date;
}

// Activation Phase
export interface ActivationStep {
  type: "activation_step";
  shipId: string;
  timestamp: Date;
}

export interface BeginManeuver {
  type: "begin_maneuver";
  shipId: string;
  timestamp: Date;
}

export interface CleanManeuver {
  type: "clean_maneuver";
  shipId: string;
  timestamp: Date;
}

export interface Collide {
  type: "collide";
  shipId: string;
  collisionType: CollisionType;
  landedOnObstacle: boolean;
  timestamp: Date;
}

export interface StressCheck {
  type: "stress_check";
  shipId: string;
  timestamp: Date;
}

export interface PerformAction {
  type: "perform_action";
  shipId: string;
  action: ActionType;
  targetShipId?: string;
  timestamp: Date;
}

export interface ActionSkipped {
  type: "action_skipped";
  shipId: string;
  timestamp: Date;
}

export interface SelectActionAgain {
  type: "select_action_again";
  shipId: string;
  timestamp: Date;
}

export interface DoneWithActions {
  type: "done_with_actions";
  shipId: string;
  timestamp: Date;
}

export interface DetonateBomb {
  type: "detonate_bomb";
  bombId: string;
  affectedShipIds: string[];
  timestamp: Date;
}

export interface DestroyObstacle {
  type: "destroy_obstacle";
  obstacleId: string;
  timestamp: Date;
}

// Tokens & Conditions
export interface AssignToken {
  type: "assign_token";
  sourceShipId: string;
  tokenType: TokenType;
  conditionId: string | null;
  reinforceDirection: ReinforceDirection | null;
  targetShipId: string | null;
  timestamp: Date;
}

export interface SpendToken {
  type: "spend_token";
  shipId: string;
  tokenType: TokenType;
  timestamp: Date;
}

export interface AssignCondition {
  type: "assign_condition";
  shipId: string;
  sourceShipId: string | null;
  conditionId: string;
  timestamp: Date;
}

export interface TriggerAbility {
  type: "trigger_ability";
  shipId: string;
  abilityId: string;
  timestamp: Date;
}

// Combat Phase
export interface BeginCombat {
  type: "combat_step";
  pilotSkill: number;
  timestamp: Date;
}

export interface BeginSelectTarget {
  type: "begin_select_target";
  timestamp: Date;
}

export interface DeclareTarget {
  type: "declare_target";
  attackerShipId: string;
  defenderShipId: string;
  weaponId: string;
  baseAttackDice: number;
  baseDefenseDice: number;
  timestamp: Date;
}

export interface RollAttackDice {
  type: "roll_attack_dice";
  results: DiceResult[];
  timestamp: Date;
}

export interface ModifyAttackDice {
  type: "modify_attack_dice";
  attackerShipId: string;
  beforeResults: DiceResult[];
  afterResults: DiceResult[];
  timestamp: Date;
}

export interface RollDefenseDice {
  type: "roll_defense_dice";
  defenderShipId: string;
  results: DiceResult[];
  timestamp: Date;
}

export interface ModifyDefenseDice {
  type: "modify_defense_dice";
  defenderShipId: string;
  beforeResults: DiceResult[];
  afterResults: DiceResult[];
  timestamp: Date;
}

export interface CompleteAttack {
  type: "complete_attack";
  attackerShipId: string;
  timestamp: Date;
}

export interface FlipUpgrade {
  type: "flip_upgrade";
  shipId: string;
  upgradeId: string;
  faceUp: boolean;
  timestamp: Date;
}

export interface SpendAmmo {
  type: "spend_ammo";
  shipId: string;
  weaponId: string;
  ammoRemaining: number;
  timestamp: Date;
}

export interface ApplyDamage {
  type: "apply_damage";
  shipId: string;
  hitsApplied: number;
  critsApplied: number;
  hullRemaining: number;
  shieldsRemaining: number;
  timestamp: Date;
}

export interface ShipHalfHealth {
  type: "ship_half_health";
  shipId: string;
  timestamp: Date;
}

export interface AssignCrit {
  type: "assign_crit";
  shipId: string;
  critCardId: string;
  timestamp: Date;
}

export interface FlipCrit {
  type: "flip_crit";
  shipId: string;
  critCardId: string;
  faceUp: boolean;
  timestamp: Date;
}

export interface DestroyShip {
  type: "destroy_ship";
  shipId: string;
  destroyedByShipId: string;
  timestamp: Date;
}

// End Phase
export interface Cleanup {
  type: "cleanup";
  timestamp: Date;
}
