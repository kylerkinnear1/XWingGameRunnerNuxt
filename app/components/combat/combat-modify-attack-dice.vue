<script setup lang="ts">
import type { AttackDie, AttackDieFace } from "#shared/dice";

const props = defineProps<{
  initialDice: AttackDie[];
}>();

const emit = defineEmits<{
  confirm: [dice: AttackDie[]];
}>();

const dice = ref<AttackDie[]>(JSON.parse(JSON.stringify(props.initialDice)));
const selectedDieId = ref<string | null>(null);
const isModifyDrawerOpen = ref(false);

const attackFaces: AttackDieFace[] = ["hit", "crit", "focus", "blank"];

function handleDieClick(die: AttackDie) {
  selectedDieId.value = die.id;
  isModifyDrawerOpen.value = true;
}

function changeDieFace(newFace: AttackDieFace) {
  if (!selectedDieId.value) return;

  const dieIndex = dice.value.findIndex((d) => d.id === selectedDieId.value);
  if (dieIndex !== -1) {
    dice.value[dieIndex]!.face = newFace;
  }

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

function getDieImage(face: AttackDieFace): string {
  const imageMap: Record<AttackDieFace, string> = {
    hit: "/AttackHit.png",
    crit: "/AttackCrit.png",
    focus: "/AttackFocus.png",
    blank: "/AttackMiss.png",
  };
  return imageMap[face];
}
</script>

<template>
  <div class="modify-attack-dice-component relative z-10 h-full">
    <div class="dice-preview mb-4 flex flex-wrap justify-center gap-3">
      <div
        v-for="die in dice"
        :key="die.id"
        class="die-button attack-die"
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
            <h3 class="drawer-title">Select New Face</h3>
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
          <div class="face-options flex flex-wrap justify-center gap-3">
            <button
              v-for="face in attackFaces"
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
    </Transition>

    <div class="flex justify-center">
      <button class="roll-button" @click="handleConfirm">
        Confirm Modifications
      </button>
    </div>
  </div>
</template>

<style scoped>
.modify-attack-dice-component {
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

.die-button.attack-die.unrolled {
  opacity: 1;
}

.die-button.attack-die.selected {
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
