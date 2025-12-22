<script setup lang="ts">
import type { DefenseDie, DefenseDieFace } from "~/types/dice";
import { DEFENSE_DIE_ICONS } from "~/types/dice";
import { rollDefenseDice, createUnrolledDefenseDice } from "~/utils/dice";

const props = defineProps<{
  initialCount?: number;
}>();

const emit = defineEmits<{
  complete: [dice: DefenseDie[]];
}>();

// Component state
const dice = ref<DefenseDie[]>([]);
const diceCount = ref(props.initialCount || 3);
const isRolled = ref(false);
const selectedDieId = ref<string | null>(null);
const isModifyDrawerOpen = ref(false);

// Face options for modification
const defenseFaces: DefenseDieFace[] = ["evade", "focus", "blank"];

// Roll the dice
function handleRollDice() {
  dice.value = rollDefenseDice(diceCount.value);
  isRolled.value = true;
}

// Use real dice (skip rolling, let user enter results)
function handleUseRealDice() {
  dice.value = createUnrolledDefenseDice(diceCount.value);
  isRolled.value = true;
}

// Add a die
function addDie() {
  const newDie: DefenseDie = {
    id: crypto.randomUUID(),
    face: "blank",
  };
  dice.value.push(newDie);
  diceCount.value = dice.value.length;
}

// Remove a die
function removeDie() {
  if (dice.value.length > 0) {
    dice.value.pop();
    diceCount.value = dice.value.length;
  }
}

// Open modify drawer for a specific die
function handleDieClick(die: DefenseDie) {
  if (!isRolled.value) return;
  selectedDieId.value = die.id;
  isModifyDrawerOpen.value = true;
}

// Change the face of the selected die
function changeDieFace(newFace: DefenseDieFace) {
  if (!selectedDieId.value) return;

  const dieIndex = dice.value.findIndex((d) => d.id === selectedDieId.value);
  if (dieIndex !== -1) {
    dice.value[dieIndex].face = newFace;
  }

  isModifyDrawerOpen.value = false;
  selectedDieId.value = null;
}

// Complete dice roll
function handleComplete() {
  emit("complete", dice.value);
}

// Get the currently selected die for the drawer
const selectedDie = computed(() => {
  if (!selectedDieId.value) return null;
  return dice.value.find((d) => d.id === selectedDieId.value) || null;
});

// Get die icon
function getDieIcon(face: DefenseDieFace): string {
  return DEFENSE_DIE_ICONS[face];
}

// Get die label for accessibility
function getDieLabel(face: DefenseDieFace): string {
  return face.charAt(0).toUpperCase() + face.slice(1);
}
</script>

<template>
  <div class="defense-dice-component">
    <!-- Initial Setup Screen -->
    <div v-if="!isRolled" class="setup-screen">
      <div class="dice-count-control">
        <label class="text-lg font-semibold mb-2 block"
          >Number of Defense Dice</label
        >
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-minus"
            color="gray"
            :disabled="diceCount <= 0"
            @click="diceCount--"
          />
          <span class="text-2xl font-bold w-12 text-center">{{
            diceCount
          }}</span>
          <UButton icon="i-heroicons-plus" color="gray" @click="diceCount++" />
        </div>
      </div>

      <div class="action-buttons mt-6 flex flex-col gap-3">
        <UButton size="xl" color="green" block @click="handleRollDice">
          <span class="text-lg">Roll Dice</span>
        </UButton>

        <UButton
          size="xl"
          color="gray"
          variant="outline"
          block
          @click="handleUseRealDice"
        >
          <span class="text-lg">Use Real Dice</span>
        </UButton>
      </div>
    </div>

    <!-- Rolled Dice Screen -->
    <div v-else class="rolled-screen">
      <div class="dice-controls mb-4 flex gap-2">
        <UButton icon="i-heroicons-plus" color="gray" @click="addDie">
          Add Die
        </UButton>
        <UButton
          icon="i-heroicons-minus"
          color="gray"
          :disabled="dice.length === 0"
          @click="removeDie"
        >
          Remove Die
        </UButton>
      </div>

      <div class="dice-display grid grid-cols-4 gap-4 mb-6">
        <button
          v-for="die in dice"
          :key="die.id"
          class="die-button defense-die"
          :class="{ blank: die.face === 'blank' }"
          @click="handleDieClick(die)"
        >
          <span
            v-if="die.face !== 'blank'"
            class="xwing-miniatures-ship die-icon"
          >
            {{ getDieIcon(die.face) }}
          </span>
          <span v-else class="blank-text">Blank</span>
        </button>
      </div>

      <UButton size="lg" color="primary" block @click="handleComplete">
        Confirm Results
      </UButton>
    </div>

    <!-- Modify Die Drawer -->
    <UDrawer v-model:open="isModifyDrawerOpen" side="bottom">
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-4">Modify Die Result</h3>

        <div
          v-if="selectedDie"
          class="current-face mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <span class="text-sm text-gray-600 dark:text-gray-400">Current:</span>
          <div
            class="die-button defense-die mt-2"
            :class="{ blank: selectedDie.face === 'blank' }"
          >
            <span
              v-if="selectedDie.face !== 'blank'"
              class="xwing-miniatures-ship die-icon"
            >
              {{ getDieIcon(selectedDie.face) }}
            </span>
            <span v-else class="blank-text">Blank</span>
          </div>
        </div>

        <div class="face-options grid grid-cols-3 gap-3">
          <button
            v-for="face in defenseFaces"
            :key="face"
            class="die-button defense-die"
            :class="{
              blank: face === 'blank',
              selected: selectedDie?.face === face,
            }"
            @click="changeDieFace(face)"
          >
            <span
              v-if="face !== 'blank'"
              class="xwing-miniatures-ship die-icon"
            >
              {{ getDieIcon(face) }}
            </span>
            <span v-else class="blank-text">Blank</span>
          </button>
        </div>
      </div>
    </UDrawer>
  </div>
</template>

<style scoped>
.defense-dice-component {
  padding: 1rem;
}

.setup-screen {
  max-width: 400px;
  margin: 0 auto;
}

.dice-count-control {
  text-align: center;
}

.die-button {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  border: 2px solid #16a34a;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-height: 80px;
}

.die-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
}

.die-button:active {
  transform: scale(0.95);
}

.die-button.blank {
  background: linear-gradient(135deg, #14532d 0%, #166534 100%);
  border-color: #166534;
}

.die-button.selected {
  border-color: #fbbf24;
  border-width: 3px;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
}

.die-icon {
  font-size: 3rem;
  line-height: 1;
}

.blank-text {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.7;
}

.current-face .die-button {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.face-options .die-button {
  min-height: 60px;
}
</style>
