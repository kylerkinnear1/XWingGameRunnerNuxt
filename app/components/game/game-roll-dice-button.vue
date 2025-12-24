<script setup lang="ts">
import type { AttackDie, DefenseDie } from "#shared/dice";

const showDiceModal = ref(false);
const showCompareModal = ref(false);
const showDiceOptions = ref(false);
const diceType = ref<"attack" | "defense" | "both">("attack");
const diceCount = ref(1);
const attackDiceCount = ref(1);
const defenseDiceCount = ref(1);
const buttonContainer = ref<HTMLElement | null>(null);

const attackDice = ref<AttackDie[]>([]);
const defenseDice = ref<DefenseDie[]>([]);
const modifiedAttackDice = ref<AttackDie[]>([]);
const modifiedDefenseDice = ref<DefenseDie[]>([]);

const showModifyAttack = ref(false);
const showModifyDefense = ref(false);
const showAttackRoll = ref(false);
const showDefenseRoll = ref(false);

function openModal(type: "attack" | "defense" | "both") {
  showDiceOptions.value = false;
  diceType.value = type;
  if (type === "both") {
    attackDiceCount.value = 1;
    defenseDiceCount.value = 1;
    showAttackRoll.value = true;
    showDefenseRoll.value = false;
  } else {
    diceCount.value = 1;
    if (type === "attack") {
      showAttackRoll.value = true;
      showDefenseRoll.value = false;
    } else {
      showAttackRoll.value = false;
      showDefenseRoll.value = true;
    }
  }
  showModifyAttack.value = false;
  showModifyDefense.value = false;
  showCompareModal.value = false;
  attackDice.value = [];
  defenseDice.value = [];
  modifiedAttackDice.value = [];
  modifiedDefenseDice.value = [];
  showDiceModal.value = true;
}

function closeModal() {
  showDiceModal.value = false;
  showCompareModal.value = false;
  showModifyAttack.value = false;
  showModifyDefense.value = false;
  showAttackRoll.value = false;
  showDefenseRoll.value = false;
  attackDice.value = [];
  defenseDice.value = [];
  modifiedAttackDice.value = [];
  modifiedDefenseDice.value = [];
}

function handleAttackDiceComplete(dice: AttackDie[]) {
  attackDice.value = dice;
  modifiedAttackDice.value = [...dice];
  showAttackRoll.value = false;
  showModifyAttack.value = true;
}

function handleAttackModifyComplete(dice: AttackDie[]) {
  modifiedAttackDice.value = dice;
  showModifyAttack.value = false;
  
  if (diceType.value === "both") {
    showDefenseRoll.value = true;
  } else {
    closeModal();
  }
}

function handleDefenseDiceComplete(dice: DefenseDie[]) {
  defenseDice.value = dice;
  modifiedDefenseDice.value = [...dice];
  showDefenseRoll.value = false;
  showModifyDefense.value = true;
}

function handleDefenseModifyComplete(dice: DefenseDie[]) {
  modifiedDefenseDice.value = dice;
  showModifyDefense.value = false;
  
  if (diceType.value === "both") {
    showDiceModal.value = false;
    showCompareModal.value = true;
  } else {
    closeModal();
  }
}

function handleClickOutside(event: MouseEvent) {
  if (buttonContainer.value && !buttonContainer.value.contains(event.target as Node)) {
    showDiceOptions.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div ref="buttonContainer" class="fixed bottom-4 right-4 z-50 flex items-center">
    <div class="flex flex-col items-end gap-2">
      <!-- Dice Options (shown above button when clicked) -->
      <div
        v-if="showDiceOptions"
        class="flex flex-col gap-2 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl"
      >
        <AppButton variant="primary" size="md" @click="openModal('attack')">
          Roll Attack Dice
        </AppButton>
        <AppButton variant="primary" size="md" @click="openModal('defense')">
          Roll Defense Dice
        </AppButton>
        <AppButton variant="primary" size="md" @click="openModal('both')">
          Roll Both
        </AppButton>
      </div>
      
      <!-- Main Roll Dice Button -->
      <AppButton variant="primary" size="lg" @click="showDiceOptions = !showDiceOptions">
        Roll Dice
      </AppButton>
    </div>

    <!-- Dice Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDiceModal"
          class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
          @click.self="closeModal"
        >
          <div
            class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-white">
                {{
                  diceType === "both"
                    ? "Roll Attack & Defense Dice"
                    : diceType === "attack"
                    ? "Roll Attack Dice"
                    : "Roll Defense Dice"
                }}
              </h2>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Dice Count Controls for "Roll Both" -->
            <div
              v-if="diceType === 'both' && showAttackRoll"
              class="mb-6 flex justify-center gap-8"
            >
              <div class="flex flex-col items-center gap-2">
                <label class="text-sm text-gray-400">Attack Dice</label>
                <div class="flex items-center gap-3">
                  <button
                    class="dice-control-button"
                    :disabled="attackDiceCount <= 0"
                    @click="attackDiceCount = Math.max(0, attackDiceCount - 1)"
                  >
                    <span class="text-xl">−</span>
                  </button>
                  <span class="text-2xl font-bold w-12 text-center text-white">{{
                    attackDiceCount
                  }}</span>
                  <button
                    class="dice-control-button"
                    @click="attackDiceCount++"
                  >
                    <span class="text-xl">+</span>
                  </button>
                </div>
              </div>
              <div class="flex flex-col items-center gap-2">
                <label class="text-sm text-gray-400">Defense Dice</label>
                <div class="flex items-center gap-3">
                  <button
                    class="dice-control-button"
                    :disabled="defenseDiceCount <= 0"
                    @click="defenseDiceCount = Math.max(0, defenseDiceCount - 1)"
                  >
                    <span class="text-xl">−</span>
                  </button>
                  <span class="text-2xl font-bold w-12 text-center text-white">{{
                    defenseDiceCount
                  }}</span>
                  <button
                    class="dice-control-button"
                    @click="defenseDiceCount++"
                  >
                    <span class="text-xl">+</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Attack Roll -->
            <CombatAttackDice
              v-if="showAttackRoll"
              :initial-count="diceType === 'both' ? attackDiceCount : diceCount"
              @complete="handleAttackDiceComplete"
            />

            <!-- Attack Modify -->
            <CombatModifyAttackDice
              v-if="showModifyAttack"
              :initial-dice="modifiedAttackDice"
              @confirm="handleAttackModifyComplete"
            />

            <!-- Defense Roll -->
            <CombatDefenseDice
              v-if="showDefenseRoll"
              :initial-count="diceType === 'both' ? defenseDiceCount : diceCount"
              @complete="handleDefenseDiceComplete"
            />

            <!-- Defense Modify -->
            <CombatModifyDefenseDice
              v-if="showModifyDefense"
              :initial-dice="modifiedDefenseDice"
              @confirm="handleDefenseModifyComplete"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Compare Results Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <GameCompareDiceResults
          v-if="showCompareModal"
          :attack-dice="modifiedAttackDice"
          :defense-dice="modifiedDefenseDice"
          @continue="closeModal"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
</style>
