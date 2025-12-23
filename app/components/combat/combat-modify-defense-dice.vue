<script setup lang="ts">
import type { DefenseDie, DefenseDieFace } from "#shared/dice";
import { rollDefenseDie } from "#app/domain/dice";

const props = defineProps<{
  initialDice: DefenseDie[];
}>();

const emit = defineEmits<{
  confirm: [dice: DefenseDie[]];
}>();

const dice = ref<DefenseDie[]>(JSON.parse(JSON.stringify(props.initialDice)));
const selectedDieId = ref<string | null>(null);
const isModifyDrawerOpen = ref(false);
const isRerolling = ref(false);

const defenseFaces: DefenseDieFace[] = ["evade", "focus", "blank"];

function handleDieClick(die: DefenseDie) {
  selectedDieId.value = die.id;
  isModifyDrawerOpen.value = true;
}

function changeDieFace(newFace: DefenseDieFace) {
  if (!selectedDieId.value) return;

  const dieIndex = dice.value.findIndex((d) => d.id === selectedDieId.value);
  if (dieIndex !== -1) {
    dice.value[dieIndex]!.face = newFace;
  }

  isModifyDrawerOpen.value = false;
  selectedDieId.value = null;
}

async function rerollDie() {
  if (!selectedDieId.value) return;

  isRerolling.value = true;
  
  // Animate the reroll with a brief delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const dieIndex = dice.value.findIndex((d) => d.id === selectedDieId.value);
  if (dieIndex !== -1) {
    dice.value[dieIndex]!.face = rollDefenseDie();
  }

  isRerolling.value = false;
  isModifyDrawerOpen.value = false;
  selectedDieId.value = null;
}

function handleConfirm() {
  emit("confirm", dice.value);
}

const selectedDie = computed(() => {
  if (!selectedDieId.value) return null;
  return dice.value.find((d) => d.id === selectedDieId.value) || null;
});

function getDieImage(face: DefenseDieFace): string {
  const imageMap: Record<DefenseDieFace, string> = {
    evade: "/DefenseEvade.png",
    focus: "/DefenseFocus.png",
    blank: "/DefenseMiss.png",
  };
  return imageMap[face];
}
</script>

<template>
  <div class="modify-defense-dice-component relative z-10 h-full">
    <div class="dice-preview mb-4 flex flex-wrap justify-center gap-3">
      <div
        v-for="die in dice"
        :key="die.id"
        class="die-button defense-die"
        :class="{
          unrolled: true,
          selected: selectedDieId === die.id,
        }"
        @click="handleDieClick(die)"
      >
        <img :src="getDieImage(die.face)" :alt="die.face" class="die-image" />
      </div>
    </div>

    <div
      class="dice-controls-spacer mb-6 flex justify-center items-center gap-3"
    >
      <div class="dice-control-button invisible">
        <span class="text-xl">−</span>
      </div>
      <div class="text-2xl font-bold w-12 text-center text-white invisible">
        0
      </div>
      <div class="dice-control-button invisible">
        <span class="text-xl">+</span>
      </div>
    </div>

    <Transition name="drawer-slide">
      <div v-if="isModifyDrawerOpen" class="modify-drawer mb-6">
        <div class="drawer-content">
          <div class="drawer-header">
            <h3 class="drawer-title">Modify Die</h3>
            <button
              class="drawer-close"
              @click="
                isModifyDrawerOpen = false;
                selectedDieId = null;
              "
            >
              <span class="text-xl">×</span>
            </button>
          </div>
          <div class="modify-options">
            <button
              class="reroll-button"
              :disabled="isRerolling"
              @click="rerollDie"
            >
              <span class="reroll-icon">🎲</span>
              <span class="reroll-text">Reroll</span>
            </button>
            <div class="divider">
              <span class="divider-text">OR</span>
            </div>
            <div class="face-options flex flex-wrap justify-center gap-3">
              <button
                v-for="face in defenseFaces"
                :key="face"
                class="face-option-button"
                :class="{ active: selectedDie?.face === face }"
                @click="changeDieFace(face)"
              >
                <img :src="getDieImage(face)" :alt="face" class="die-image" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="flex justify-center">
      <button class="roll-button" @click="handleConfirm">
        Confirm Modifications
      </button>
    </div>
  </div>
</template>

<style scoped>
.modify-defense-dice-component {
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
  cursor: pointer;
}

.die-button.defense-die.unrolled {
  opacity: 1;
}

.die-button.defense-die.selected {
  outline: 3px solid #fbbf24;
  outline-offset: 4px;
  border-radius: 0.5rem;
}

.die-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dice-controls-spacer {
  height: 36px;
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
  font-weight: 600;
}

.modify-drawer {
  width: 100%;
  max-width: 800px;
  overflow: hidden;
}

.drawer-content {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.drawer-close {
  width: 32px;
  height: 32px;
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
  padding: 0;
}

.drawer-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.drawer-close:active {
  transform: scale(0.95);
}

.modify-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.reroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  background-color: rgb(234 88 12);
  color: white;
  border-bottom: 4px solid rgb(194 65 12);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  cursor: pointer;
  border: none;
  min-width: 200px;
  width: 100%;
  max-width: 300px;
}

.reroll-button:hover:not(:disabled) {
  background-color: rgb(249 115 22);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.reroll-button:active:not(:disabled) {
  border-bottom-width: 2px;
  transform: translateY(2px);
}

.reroll-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reroll-icon {
  font-size: 1.5rem;
}

.reroll-text {
  font-size: 1rem;
}

.divider {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.face-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.face-option-button {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 150px;
  height: 150px;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.5rem;
  flex-shrink: 0;
  cursor: pointer;
}

.face-option-button:hover {
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.face-option-button:active {
  transform: scale(1.02);
}

.face-option-button.active {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
}

.face-option-button .die-image {
  width: calc(100% - 1rem);
  height: calc(100% - 1rem);
}

@media (max-width: 640px) {
  .drawer-content {
    padding: 1rem;
  }

  .face-option-button {
    width: 120px;
    height: 120px;
  }

  .drawer-title {
    font-size: 1rem;
  }
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
  cursor: pointer;
}

.roll-button:hover {
  background-color: rgb(20 184 166);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.roll-button:active {
  border-bottom-width: 2px;
  transform: translateY(2px);
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  overflow: hidden;
}

.drawer-slide-enter-from {
  opacity: 0;
  max-height: 0;
}

.drawer-slide-enter-to {
  opacity: 1;
  max-height: 1000px;
}

.drawer-slide-leave-from {
  opacity: 1;
  max-height: 1000px;
}

.drawer-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
