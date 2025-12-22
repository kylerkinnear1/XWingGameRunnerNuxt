<script setup lang="ts">
import type { DefenseDie } from "#shared/dice";
import { rollDefenseDice } from "~/domain/dice";

const props = defineProps<{
  initialCount?: number;
}>();

const emit = defineEmits<{
  rollComplete: [dice: DefenseDie[]];
}>();

// Component state - start with initial count or default to 0
const diceCount = ref(Math.max(0, Number(props.initialCount) || 0));

// Create black (unrolled) dice for display
const previewDice = computed(() => {
  const count = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  const dice: Array<{ id: string }> = [];
  for (let i = 0; i < count; i++) {
    dice.push({ id: `preview-${i}` });
  }
  return dice;
});

// Add a die
function addDie() {
  const current = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  diceCount.value = current + 1;
}

// Remove a die
function removeDie() {
  const current = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  if (current > 0) {
    diceCount.value = current - 1;
  }
}

// Roll the dice and emit results
function handleRollDice() {
  const count = Math.max(0, Math.floor(Number(diceCount.value)) || 0);
  const rolledDice = rollDefenseDice(count);
  emit("rollComplete", rolledDice);
}
</script>

<template>
  <div class="roll-defense-dice-component">
    <div class="dice-controls mb-4 flex justify-center items-center gap-2">
      <UButton
        icon="i-heroicons-minus"
        color="neutral"
        size="lg"
        :disabled="diceCount <= 0"
        @click="removeDie"
      />
      <span class="text-2xl font-bold w-16 text-center">{{ diceCount }}</span>
      <UButton
        icon="i-heroicons-plus"
        color="neutral"
        size="lg"
        @click="addDie"
      />
    </div>

    <div class="dice-preview grid grid-cols-4 gap-4 mb-6">
      <div
        v-for="die in previewDice"
        :key="die.id"
        class="die-button defense-die unrolled"
      >
        <span class="blank-text">?</span>
      </div>
    </div>

    <UButton size="xl" color="success" block @click="handleRollDice">
      <span class="text-lg">Roll Defense Dice</span>
    </UButton>
  </div>
</template>

<style scoped>
.roll-defense-dice-component {
  padding: 1rem;
}

.die-button {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-height: 80px;
}

.die-button.defense-die.unrolled {
  border: 2px solid #374151;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #6b7280;
}

.blank-text {
  font-size: 2rem;
  font-weight: 600;
  opacity: 0.5;
}
</style>
