import type {
  AttackDie,
  DefenseDie,
  AttackDieFace,
  DefenseDieFace,
} from "#shared/dice";
import { ATTACK_DICE_WEIGHTS, DEFENSE_DICE_WEIGHTS } from "#shared/dice";

/**
 * Roll a single attack die using weighted probabilities
 */
export function rollAttackDie(): AttackDieFace {
  const faces: AttackDieFace[] = [];

  // Build weighted array based on probabilities
  for (const [face, weight] of Object.entries(ATTACK_DICE_WEIGHTS)) {
    for (let i = 0; i < weight; i++) {
      faces.push(face as AttackDieFace);
    }
  }

  const randomIndex = Math.floor(Math.random() * faces.length);
  return faces[randomIndex];
}

/**
 * Roll a single defense die using weighted probabilities
 */
export function rollDefenseDie(): DefenseDieFace {
  const faces: DefenseDieFace[] = [];

  // Build weighted array based on probabilities
  for (const [face, weight] of Object.entries(DEFENSE_DICE_WEIGHTS)) {
    for (let i = 0; i < weight; i++) {
      faces.push(face as DefenseDieFace);
    }
  }

  const randomIndex = Math.floor(Math.random() * faces.length);
  return faces[randomIndex];
}

/**
 * Roll multiple attack dice
 */
export function rollAttackDice(count: number): AttackDie[] {
  const dice: AttackDie[] = [];

  for (let i = 0; i < count; i++) {
    dice.push({
      id: crypto.randomUUID(),
      face: rollAttackDie(),
    });
  }

  return dice;
}

/**
 * Roll multiple defense dice
 */
export function rollDefenseDice(count: number): DefenseDie[] {
  const dice: DefenseDie[] = [];

  for (let i = 0; i < count; i++) {
    dice.push({
      id: crypto.randomUUID(),
      face: rollDefenseDie(),
    });
  }

  return dice;
}

/**
 * Create unrolled dice (for "use real dice" mode)
 */
export function createUnrolledAttackDice(count: number): AttackDie[] {
  const dice: AttackDie[] = [];

  for (let i = 0; i < count; i++) {
    dice.push({
      id: crypto.randomUUID(),
      face: "blank", // Start with blank, user will modify
    });
  }

  return dice;
}

/**
 * Create unrolled defense dice (for "use real dice" mode)
 */
export function createUnrolledDefenseDice(count: number): DefenseDie[] {
  const dice: DefenseDie[] = [];

  for (let i = 0; i < count; i++) {
    dice.push({
      id: crypto.randomUUID(),
      face: "blank", // Start with blank, user will modify
    });
  }

  return dice;
}
