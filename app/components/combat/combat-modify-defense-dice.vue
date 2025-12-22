<script setup lang="ts">
import type { DefenseDie, DefenseDieFace } from "#shared/dice";
import { DEFENSE_DIE_ICONS } from "#shared/dice";

const props = defineProps<{
  initialDice: DefenseDie[];
}>();

const emit = defineEmits<{
  confirm: [dice: DefenseDie[]];
}>();

// Component state - clone the initial dice so we don't mutate props
const dice = ref<DefenseDie[]>(JSON.parse(JSON.stringify(props.initialDice)));
const selectedDieId = ref<string | null>(null);
const isModifyDrawerOpen = ref(false);

// Face options for modification
const defenseFaces: DefenseDieFace[] = ["evade", "focus", "blank"];

// Open modify drawer for a specific die
function handleDieClick(die: DefenseDie) {
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
function getDieIcon(face: DefenseDieFace): string {
  return DEFENSE_DIE_ICONS[face];
}
</script>

<template>
  <div class="modify-defense-dice-component">
    <div class="dice-preview grid grid-cols-4 gap-4 mb-6">
      <div
        v-for="die in dice"
        :key="die.id"
        class="die-button defense-die unrolled"
        :class="{
          selected: selectedDieId === die.id,
        }"
        @click="handleDieClick(die)"
      >
        <span
          v-if="die.face !== 'blank'"
          class="xwing-miniatures-ship die-icon"
        >
          {{ getDieIcon(die.face) }}
        </span>
        <span v-else class="blank-text">?</span>
      </div>
    </div>

    <Transition name="drawer-slide">
      <div v-if="isModifyDrawerOpen" class="modify-drawer mb-6">
        <div class="face-options grid grid-cols-3 gap-4">
          <button
            v-for="face in defenseFaces"
            :key="face"
            class="face-option-button defense-die"
            @click="changeDieFace(face)"
          >
            <span
              v-if="face !== 'blank'"
              class="xwing-miniatures-ship die-icon"
            >
              {{ getDieIcon(face) }}
            </span>
            <span v-else class="blank-text">?</span>
          </button>
        </div>
      </div>
    </Transition>

    <UButton size="xl" color="success" block @click="handleConfirm">
      <span class="text-lg">Confirm Modifications</span>
    </UButton>
  </div>
</template>

<style scoped>
.modify-defense-dice-component {
  padding: 1rem;
}

.dice-preview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
}

.die-button {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-height: 80px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.die-button.defense-die.selected {
  outline: 3px solid #fbbf24;
  outline-offset: 4px;
  border-radius: 0.5rem;
}

.die-icon {
  font-size: 3rem;
  line-height: 1;
}

.blank-text {
  font-size: 2rem;
  font-weight: 600;
  opacity: 0.5;
}

.modify-drawer {
  width: 100%;
}

.face-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.face-option-button {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-height: 80px;
  cursor: pointer;
  background: transparent;
  border: 2px solid #374151;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #6b7280;
}

.face-option-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.face-option-button:active {
  transform: scale(0.95);
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.2s ease-out;
}

.drawer-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.drawer-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.drawer-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.drawer-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
