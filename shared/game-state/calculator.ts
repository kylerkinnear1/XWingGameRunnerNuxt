import type { SquadReadDto } from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type {
  GameStateDto,
  CurrentGameState,
  GameStepDto,
} from "#shared/game-state-dto";
import { GamePhase, CurrentGamePage } from "#shared/enums";

import * as setupHandlers from "./handlers/setup";
import * as planningHandlers from "./handlers/planning";
import * as activationHandlers from "./handlers/activation";
import * as combatHandlers from "./handlers/combat";
import * as cleanupHandlers from "./handlers/cleanup";
import * as anyPhaseHandlers from "./handlers/any-phase";

export function calculateGameState(
  gameState: GameStateDto,
  squads: readonly SquadReadDto[],
  cards: CardsDto
): CurrentGameState {
  const currentState: CurrentGameState = {
    currentStep: 0,
    ships: [],
    playerWithInitiative: "",
    bombIds: [],
    mineIds: [],
    obstacles: [],
    player1Points: 0,
    player2Points: 0,
    totalTurns: 0,
    currentPhase: GamePhase.Start,
    uiScreen: CurrentGamePage.GameStart,
    currentActivatingShipId: null,
    currentAttackingShipId: null,
    currentDefendingShipId: null,
  };

  for (const step of gameState.steps) {
    handleStep(step, currentState, squads, cards);
  }

  return currentState;
}

export function handleStep(
  step: GameStepDto,
  currentState: CurrentGameState,
  squads: readonly SquadReadDto[],
  cards: CardsDto
) {
  switch (step.type) {
    case "game_start":
      setupHandlers.handleGameStart(step, currentState, squads, cards);
      break;
    case "increase_max_hull":
      setupHandlers.handleIncreaseMaxHull(step, currentState, squads, cards);
      break;
    case "increase_max_shields":
      setupHandlers.handleIncreaseMaxShields(step, currentState, squads, cards);
      break;
    case "begin_select_initiative":
      setupHandlers.handleBeginSelectInitiative(
        step,
        currentState,
        squads,
        cards
      );
      break;
    case "initiative_selected":
      setupHandlers.handleInitiativeSelected(step, currentState, squads, cards);
      break;
    case "start_setup":
      setupHandlers.handleStartSetup(step, currentState, squads, cards);
      break;
    case "place_obstacle":
      setupHandlers.handlePlaceObstacle(step, currentState, squads, cards);
      break;
    case "ship_placed":
      setupHandlers.handleShipPlaced(step, currentState, squads, cards);
      break;
    case "end_setup":
      setupHandlers.handleEndSetup(step, currentState, squads, cards);
      break;
    case "turn_start":
      planningHandlers.handleTurnStart(step, currentState, squads, cards);
      break;
    case "planning":
      planningHandlers.handlePlanning(step, currentState, squads, cards);
      break;
    case "planning_complete":
      planningHandlers.handlePlanningComplete(
        step,
        currentState,
        squads,
        cards
      );
      break;
    case "activation_step":
      activationHandlers.handleActivationStep(
        step,
        currentState,
        squads,
        cards
      );
      break;
    case "begin_maneuver":
      activationHandlers.handleBeginManeuver(step, currentState, squads, cards);
      break;
    case "clean_maneuver":
      activationHandlers.handleCleanManeuver(step, currentState, squads, cards);
      break;
    case "collide":
      activationHandlers.handleCollide(step, currentState, squads, cards);
      break;
    case "stress_check":
      activationHandlers.handleStressCheck(step, currentState, squads, cards);
      break;
    case "perform_action":
      activationHandlers.handlePerformAction(step, currentState, squads, cards);
      break;
    case "action_skipped":
      activationHandlers.handleActionSkipped(step, currentState, squads, cards);
      break;
    case "select_action_again":
      activationHandlers.handleSelectActionAgain(
        step,
        currentState,
        squads,
        cards
      );
      break;
    case "done_with_actions":
      activationHandlers.handleDoneWithActions(
        step,
        currentState,
        squads,
        cards
      );
      break;
    case "detonate_bomb":
      activationHandlers.handleDetonateBomb(step, currentState, squads, cards);
      break;
    case "destroy_obstacle":
      anyPhaseHandlers.handleDestroyObstacle(step, currentState, squads, cards);
      break;
    case "assign_token":
      anyPhaseHandlers.handleAssignToken(step, currentState, squads, cards);
      break;
    case "spend_token":
      anyPhaseHandlers.handleSpendToken(step, currentState, squads, cards);
      break;
    case "trigger_ability":
      anyPhaseHandlers.handleTriggerAbility(step, currentState, squads, cards);
      break;
    case "combat_step":
      combatHandlers.handleCombatStep(step, currentState, squads, cards);
      break;
    case "declare_attackers":
      combatHandlers.handleDeclareAttackers(step, currentState, squads, cards);
      break;
    case "select_attacker":
      combatHandlers.handleSelectAttacker(step, currentState, squads, cards);
      break;
    case "select_weapon":
      combatHandlers.handleSelectWeapon(step, currentState, squads, cards);
      break;
    case "skip_attack":
      combatHandlers.handleSkipAttack(step, currentState, squads, cards);
      break;
    case "declare_target":
      combatHandlers.handleDeclareTarget(step, currentState, squads, cards);
      break;
    case "roll_attack_dice":
      combatHandlers.handleRollAttackDice(step, currentState, squads, cards);
      break;
    case "modify_attack_dice":
      combatHandlers.handleModifyAttackDice(step, currentState, squads, cards);
      break;
    case "roll_defense_dice":
      combatHandlers.handleRollDefenseDice(step, currentState, squads, cards);
      break;
    case "complete_attack":
      combatHandlers.handleCompleteAttack(step, currentState, squads, cards);
      break;
    case "modify_defense_dice":
      combatHandlers.handleModifyDefenseDice(step, currentState, squads, cards);
      break;
    case "spend_ammo":
      anyPhaseHandlers.handleSpendAmmo(step, currentState, squads, cards);
      break;
    case "apply_damage":
      anyPhaseHandlers.handleApplyDamage(step, currentState, squads, cards);
      break;
    case "ship_half_health":
      anyPhaseHandlers.handleShipHalfHealth(step, currentState, squads, cards);
      break;
    case "assign_crit":
      anyPhaseHandlers.handleAssignCrit(step, currentState, squads, cards);
      break;
    case "remove_crit":
      anyPhaseHandlers.handleRemoveCrit(step, currentState, squads, cards);
      break;
    case "remove_facedown_damage":
      anyPhaseHandlers.handleRemoveFacedownDamage(step, currentState, squads, cards);
      break;
    case "flip_crit_facedown":
      anyPhaseHandlers.handleFlipCritFacedown(step, currentState, squads, cards);
      break;
    case "update_pilot_skill":
      anyPhaseHandlers.handleUpdatePilotSkill(step, currentState, squads, cards);
      break;
    case "decrease_shields":
      anyPhaseHandlers.handleDecreaseShields(step, currentState, squads, cards);
      break;
    case "flip_crit":
      anyPhaseHandlers.handleFlipCrit(step, currentState, squads, cards);
      break;
    case "destroy_ship":
      anyPhaseHandlers.handleDestroyShip(step, currentState, squads, cards);
      break;
    case "cleanup":
      cleanupHandlers.handleCleanup(step, currentState, squads, cards);
      break;
    case "turn_end":
      cleanupHandlers.handleTurnEnd(step, currentState, squads, cards);
      break;
    case "game_end":
      cleanupHandlers.handleGameEnd(step, currentState, squads, cards);
      break;
  }
}
