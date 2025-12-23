<script setup lang="ts">
import type { AttackDie, DefenseDie } from "#shared/dice";

const props = defineProps<{
  attackDice: AttackDie[];
  defenseDice: DefenseDie[];
}>();

const emit = defineEmits<{
  close: [];
}>();

function getAttackDieImage(face: string): string {
  const imageMap: Record<string, string> = {
    hit: "/AttackHit.png",
    crit: "/AttackCrit.png",
    focus: "/AttackFocus.png",
    blank: "/AttackMiss.png",
  };
  return imageMap[face] || "";
}

function getDefenseDieImage(face: string): string {
  const imageMap: Record<string, string> = {
    evade: "/DefenseEvade.png",
    focus: "/DefenseFocus.png",
    blank: "/DefenseMiss.png",
  };
  return imageMap[face] || "";
}

const attackTotal = computed(() => {
  const hits = props.attackDice.filter((d) => d.face === "hit").length;
  const crits = props.attackDice.filter((d) => d.face === "crit").length;
  return hits + crits;
});

const defenseTotal = computed(() => {
  return props.defenseDice.filter((d) => d.face === "evade").length;
});

const netDamage = computed(() => {
  return Math.max(0, attackTotal.value - defenseTotal.value);
});
</script>

<template>
  <div
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
    @click.self="emit('close')"
  >
    <div
      class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">Dice Results Comparison</h2>
        <button
          @click="emit('close')"
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Attack Dice -->
        <div class="bg-gray-800 rounded-lg p-4 border-2 border-red-600">
          <h3 class="text-xl font-bold text-red-400 mb-4 text-center">
            Attack
          </h3>
          <div class="flex flex-wrap justify-center gap-3 mb-4">
            <div
              v-for="die in attackDice"
              :key="die.id"
              class="die-display"
            >
              <img
                :src="getAttackDieImage(die.face)"
                :alt="die.face"
                class="die-image"
              />
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-400">{{ attackTotal }}</div>
            <div class="text-sm text-gray-400 mt-1">Total Damage</div>
          </div>
        </div>

        <!-- Defense Dice -->
        <div class="bg-gray-800 rounded-lg p-4 border-2 border-blue-600">
          <h3 class="text-xl font-bold text-blue-400 mb-4 text-center">
            Defense
          </h3>
          <div class="flex flex-wrap justify-center gap-3 mb-4">
            <div
              v-for="die in defenseDice"
              :key="die.id"
              class="die-display"
            >
              <img
                :src="getDefenseDieImage(die.face)"
                :alt="die.face"
                class="die-image"
              />
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-400">{{ defenseTotal }}</div>
            <div class="text-sm text-gray-400 mt-1">Total Evades</div>
          </div>
        </div>
      </div>

      <!-- Net Results -->
      <div class="bg-gray-800 rounded-lg p-6 border-2 border-teal-600">
        <div class="text-center">
          <div class="text-sm text-gray-400 mb-2">Net Damage</div>
          <div class="text-5xl font-bold text-red-400">{{ netDamage }}</div>
          <div
            v-if="netDamage === 0"
            class="mt-4 text-green-400 font-semibold"
          >
            ✓ All damage evaded!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.die-display {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  position: relative;
  overflow: hidden;
  background: transparent;
  flex-shrink: 0;
}

.die-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>

