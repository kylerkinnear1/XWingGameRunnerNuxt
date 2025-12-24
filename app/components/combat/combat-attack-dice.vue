<script setup lang="ts">
import type { AttackDie, AttackDieFace } from "#shared/dice";
import { rollAttackDice } from "~/domain/dice";

const props = defineProps<{
  initialCount?: number;
}>();

const emit = defineEmits<{
  complete: [dice: AttackDie[]];
}>();

const diceCount = ref(Math.max(0, Number(props.initialCount) || 0));
const isRolling = ref(false);
const rollingDice = ref<
  Array<{ id: string; currentFace: AttackDieFace | null }>
>([]);
const finalDice = ref<AttackDie[]>([]);

const attackFaces: AttackDieFace[] = ["hit", "crit", "focus", "blank"];

const hasRolled = ref(false);

const previewDice = computed(() => {
  if (isRolling.value) {
    return rollingDice.value;
  }
  if (hasRolled.value && finalDice.value.length > 0) {
    return finalDice.value.map((die) => ({
      id: die.id,
      currentFace: die.face,
    }));
  }
  const count = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  const dice: Array<{ id: string; currentFace: "blank" }> = [];
  for (let i = 0; i < count; i++) {
    dice.push({ id: `preview-${i}`, currentFace: "blank" });
  }
  return dice;
});

function addDie() {
  const current = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  diceCount.value = current + 1;
}

function removeDie() {
  const current = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  if (current > 0) {
    diceCount.value = current - 1;
  }
}

function getRandomFace(): AttackDieFace {
  const index = Math.floor(Math.random() * attackFaces.length);
  return attackFaces[index]!;
}

function getDieImage(face: AttackDieFace | null): string | null {
  if (!face) return null;
  const imageMap: Record<AttackDieFace, string> = {
    hit: "/AttackHit.png",
    crit: "/AttackCrit.png",
    focus: "/AttackFocus.png",
    blank: "/AttackMiss.png",
  };
  return imageMap[face];
}

async function handleRollDice() {
  const count = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  if (count === 0) return;

  isRolling.value = true;
  finalDice.value = rollAttackDice(count);

  rollingDice.value = finalDice.value.map((die, index) => ({
    id: die.id,
    currentFace: getRandomFace(),
  }));

  const rollDuration = 1500;
  const updateInterval = 100;
  const updates = Math.floor(rollDuration / updateInterval);
  let currentUpdate = 0;

  const rollInterval = setInterval(() => {
    currentUpdate++;
    rollingDice.value = rollingDice.value.map((die, index) => ({
      ...die,
      currentFace: getRandomFace(),
    }));

    if (currentUpdate >= updates) {
      clearInterval(rollInterval);
      rollingDice.value = finalDice.value.map((die) => ({
        id: die.id,
        currentFace: die.face,
      }));

      setTimeout(() => {
        isRolling.value = false;
        hasRolled.value = true;
        emit("complete", finalDice.value);
      }, 200);
    }
  }, updateInterval);
}
</script>

<template>
  <div class="roll-attack-dice-component relative z-10 h-full">
    <div class="dice-preview mb-4 flex flex-wrap justify-center gap-3">
      <div
        v-for="die in previewDice"
        :key="die.id"
        class="die-button attack-die"
        :class="{
          unrolled: !isRolling,
          rolling: isRolling,
        }"
      >
        <img
          v-if="getDieImage(die.currentFace)"
          :src="getDieImage(die.currentFace)!"
          :alt="die.currentFace || 'blank'"
          class="die-image"
        />
      </div>
    </div>

    <div class="dice-controls mb-6 flex justify-center items-center gap-3">
      <button
        class="dice-control-button"
        :disabled="diceCount <= 0"
        @click="removeDie"
      >
        <span class="text-xl">−</span>
      </button>
      <span class="text-2xl font-bold w-12 text-center text-white">{{
        diceCount
      }}</span>
      <button class="dice-control-button" @click="addDie">
        <span class="text-xl">+</span>
      </button>
    </div>

    <div class="flex justify-center">
      <AppButton
        variant="primary"
        size="lg"
        :disabled="isRolling || diceCount <= 0"
        @click="handleRollDice"
        class="min-w-[200px]"
      >
        {{ isRolling ? "Rolling..." : "Roll Attack Dice" }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.roll-attack-dice-component {
  padding: 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dice-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

.die-button {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 200px;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: transparent;
  border: none;
  padding: 0;
  flex-shrink: 0;
}

.die-button.attack-die.unrolled {
  opacity: 1;
}

.die-button.attack-die.rolling {
  animation: roll-pulse 0.1s ease-in-out infinite;
}

@keyframes roll-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.die-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dice-control-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.dice-control-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.dice-control-button:active:not(:disabled) {
  transform: scale(0.95);
}

.dice-control-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.roll-button {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  background-color: rgb(13 148 136);
  color: white;
  border-bottom: 4px solid rgb(17 94 89);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 200px;
  border-radius: 0.5rem;
}

.roll-button:hover:not(:disabled) {
  background-color: rgb(20 184 166);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.roll-button:active:not(:disabled) {
  border-bottom-width: 2px;
  transform: translateY(2px);
}

.roll-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
