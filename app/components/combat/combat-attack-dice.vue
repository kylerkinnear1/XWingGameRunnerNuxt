<script setup lang="ts">
import type { AttackDie, AttackDieFace } from "#shared/dice";
import { ATTACK_DIE_ICONS } from "#shared/dice";
import { rollAttackDice, createUnrolledAttackDice } from "~/domain/dice";

const props = defineProps<{
  initialCount: number;
}>();

const emit = defineEmits<{
  complete: [dice: AttackDie[]];
}>();

const dice = ref<AttackDie[]>([]);
const diceCount = ref(props.initialCount);
const isRolled = ref(false);
const selectedDieId = ref<string | null>(null);
const isModifyDrawerOpen = ref(false);

const attackFaces: AttackDieFace[] = ["hit", "crit", "focus", "blank"];

function handleRollDice() {
  dice.value = rollAttackDice(diceCount.value);
  isRolled.value = true;
}

function handleUseRealDice() {
  dice.value = createUnrolledAttackDice(diceCount.value);
  isRolled.value = true;
}

function addDie() {
  const newDie: AttackDie = {
    id: crypto.randomUUID(),
    face: "blank",
  };
  dice.value.push(newDie);
  diceCount.value = dice.value.length;
}

function removeDie() {
  if (dice.value.length > 0) {
    dice.value.pop();
    diceCount.value = dice.value.length;
  }
}

function handleDieClick(die: AttackDie) {
  if (!isRolled.value) return;
  selectedDieId.value = die.id;
  isModifyDrawerOpen.value = true;
}

function changeDieFace(newFace: AttackDieFace) {
  if (!selectedDieId.value) return;

  const dieIndex = dice.value.findIndex((d) => d.id === selectedDieId.value);
  if (dieIndex !== -1 && dice.value[dieIndex]) {
    dice.value[dieIndex].face = newFace;
  }

  isModifyDrawerOpen.value = false;
  selectedDieId.value = null;
}

function handleComplete() {
  emit("complete", dice.value);
}

const selectedDie = computed(() => {
  if (!selectedDieId.value) return null;
  return dice.value.find((d) => d.id === selectedDieId.value) || null;
});

function getDieIcon(face: AttackDieFace): string {
  return ATTACK_DIE_ICONS[face];
}

function getDieLabel(face: AttackDieFace): string {
  return face.charAt(0).toUpperCase() + face.slice(1);
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-4">Roll Attack Dice</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="!isRolled" class="max-w-md mx-auto">
        <div class="dice-count-control mb-6">
          <label class="text-lg font-semibold mb-2 block text-gray-100"
            >Number of Attack Dice</label
          >
          <div class="flex items-center gap-4">
            <UButton
              icon="i-heroicons-minus"
              color="neutral"
              :disabled="diceCount <= 0"
              @click="diceCount--"
            />
            <span class="text-2xl font-bold w-12 text-center text-gray-100">{{
              diceCount
            }}</span>
            <UButton
              icon="i-heroicons-plus"
              color="neutral"
              @click="diceCount++"
            />
          </div>
        </div>

        <div class="action-buttons flex flex-col gap-3">
          <UButton size="xl" color="error" block @click="handleRollDice">
            <span class="text-lg">Roll Dice</span>
          </UButton>

          <UButton
            size="xl"
            color="neutral"
            variant="outline"
            block
            @click="handleUseRealDice"
          >
            <span class="text-lg">Use Real Dice</span>
          </UButton>
        </div>
      </div>

      <div v-else class="max-w-4xl mx-auto">
        <div class="dice-controls mb-4 flex gap-2">
          <UButton icon="i-heroicons-plus" color="neutral" @click="addDie">
            Add Die
          </UButton>
          <UButton
            icon="i-heroicons-minus"
            color="neutral"
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
            class="die-button attack-die p-4 rounded-lg border-2 border-red-600 bg-red-900/20 hover:bg-red-900/40 transition-all"
            :class="{ blank: die.face === 'blank' }"
            @click="handleDieClick(die)"
          >
            <span
              v-if="die.face !== 'blank'"
              class="xwing-miniatures-ship die-icon text-4xl text-red-400"
            >
              {{ getDieIcon(die.face) }}
            </span>
            <span v-else class="blank-text text-gray-400">Blank</span>
          </button>
        </div>

        <UButton size="lg" color="primary" block @click="handleComplete">
          Confirm Results
        </UButton>
      </div>
    </div>

    <UDrawer v-model:open="isModifyDrawerOpen" side="bottom">
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-4 text-gray-100">
          Modify Die Result
        </h3>

        <div
          v-if="selectedDie"
          class="current-face mb-4 p-4 bg-gray-800 rounded-lg"
        >
          <span class="text-sm text-gray-400">Current:</span>
          <div
            class="die-button attack-die mt-2 p-4 rounded-lg border-2 border-red-600 bg-red-900/20"
            :class="{ blank: selectedDie.face === 'blank' }"
          >
            <span
              v-if="selectedDie.face !== 'blank'"
              class="xwing-miniatures-ship die-icon text-4xl text-red-400"
            >
              {{ getDieIcon(selectedDie.face) }}
            </span>
            <span v-else class="blank-text text-gray-400">Blank</span>
          </div>
        </div>

        <div class="face-options grid grid-cols-4 gap-3">
          <button
            v-for="face in attackFaces"
            :key="face"
            class="p-4 rounded-lg border-2 border-gray-600 bg-gray-800 hover:bg-gray-700 transition-all text-gray-100"
            @click="changeDieFace(face)"
          >
            <div class="flex flex-col items-center gap-2">
              <span
                v-if="face !== 'blank'"
                class="xwing-miniatures-ship text-3xl text-red-400"
              >
                {{ getDieIcon(face) }}
              </span>
              <span v-else class="text-gray-400">Blank</span>
              <span class="text-sm">{{ getDieLabel(face) }}</span>
            </div>
          </button>
        </div>
      </div>
    </UDrawer>
  </div>
</template>

<style scoped>
.die-button {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.die-button.blank {
  border-color: #4b5563;
  background-color: rgba(55, 65, 81, 0.2);
}
</style>
