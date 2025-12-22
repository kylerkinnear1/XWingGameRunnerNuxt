<script setup lang="ts">
import type { AttackDie, AttackDieFace } from "#shared/dice";
import { ATTACK_DIE_ICONS } from "#shared/dice";

const props = defineProps<{
  initialDice: AttackDie[];
}>();

const emit = defineEmits<{
  confirm: [dice: AttackDie[]];
}>();

// Component state - clone the initial dice so we don't mutate props
const dice = ref<AttackDie[]>(JSON.parse(JSON.stringify(props.initialDice)));
const selectedDieId = ref<string | null>(null);
const isModifyDrawerOpen = ref(false);

// Face options for modification
const attackFaces: AttackDieFace[] = ["hit", "crit", "focus", "blank"];

// Open modify drawer for a specific die
function handleDieClick(die: AttackDie) {
  selectedDieId.value = die.id;
  isModifyDrawerOpen.value = true;
}

// Change the face of the selected die
function changeDieFace(newFace: AttackDieFace) {
  if (!selectedDieId.value) return;

  const dieIndex = dice.value.findIndex((d) => d.id === selectedDieId.value);
  if (dieIndex !== -1) {
    dice.value[dieIndex].face = newFace;
  }

  isModifyDrawerOpen.value = false;
  selectedDieId.value = null;
}

// Confirm the dice results
function handleConfirm() {
  emit("confirm", dice.value);
}

// Get the currently selected die for the drawer
const selectedDie = computed(() => {
  if (!selectedDieId.value) return null;
  return dice.value.find((d) => d.id === selectedDieId.value) || null;
});

// Get die icon
function getDieIcon(face: AttackDieFace): string {
  return ATTACK_DIE_ICONS[face];
}
</script>

<template>
  <div class="modify-attack-dice-component">
    <div
      class="instruction-text mb-4 text-center text-gray-600 dark:text-gray-400"
    >
      Tap any die to modify its result
    </div>

    <div class="dice-display grid grid-cols-4 gap-4 mb-6">
      <button
        v-for="die in dice"
        :key="die.id"
        class="die-button attack-die"
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

    <UButton size="xl" color="primary" block @click="handleConfirm">
      <span class="text-lg">Confirm</span>
    </UButton>

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
            class="die-button attack-die mt-2"
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

        <div class="face-options grid grid-cols-4 gap-3">
          <button
            v-for="face in attackFaces"
            :key="face"
            class="die-button attack-die"
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
.modify-attack-dice-component {
  padding: 1rem;
}

.die-button {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  border: 2px solid #dc2626;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.die-button:active {
  transform: scale(0.95);
}

.die-button.blank {
  background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
  border-color: #991b1b;
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
