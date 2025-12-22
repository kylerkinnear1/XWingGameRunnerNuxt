<script setup lang="ts">
import type { AttackDie, DefenseDie } from "~/types/dice";

const diceMode = ref<"attack" | "defense" | null>(null);
const attackResults = ref<AttackDie[] | null>(null);
const defenseResults = ref<DefenseDie[] | null>(null);

function handleAttackComplete(dice: AttackDie[]) {
  attackResults.value = dice;
  console.log("Attack dice results:", dice);
}

function handleDefenseComplete(dice: DefenseDie[]) {
  defenseResults.value = dice;
  console.log("Defense dice results:", dice);
}

function reset() {
  diceMode.value = null;
  attackResults.value = null;
  defenseResults.value = null;
}

// Calculate attack totals
const attackTotals = computed(() => {
  if (!attackResults.value) return null;

  const totals = {
    hits: 0,
    crits: 0,
    focus: 0,
    blanks: 0,
  };

  for (const die of attackResults.value) {
    if (die.face === "hit") totals.hits++;
    else if (die.face === "crit") totals.crits++;
    else if (die.face === "focus") totals.focus++;
    else if (die.face === "blank") totals.blanks++;
  }

  return totals;
});

// Calculate defense totals
const defenseTotals = computed(() => {
  if (!defenseResults.value) return null;

  const totals = {
    evades: 0,
    focus: 0,
    blanks: 0,
  };

  for (const die of defenseResults.value) {
    if (die.face === "evade") totals.evades++;
    else if (die.face === "focus") totals.focus++;
    else if (die.face === "blank") totals.blanks++;
  }

  return totals;
});
</script>

<template>
  <div class="dice-demo-page">
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6">X-Wing Dice System Demo</h1>

      <!-- Mode Selection -->
      <div v-if="!diceMode" class="mode-selection max-w-md mx-auto">
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Select Dice Type</h2>
          </template>

          <div class="flex flex-col gap-3">
            <UButton size="xl" color="red" block @click="diceMode = 'attack'">
              <span class="text-lg">Attack Dice (Red)</span>
            </UButton>

            <UButton
              size="xl"
              color="green"
              block
              @click="diceMode = 'defense'"
            >
              <span class="text-lg">Defense Dice (Green)</span>
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Attack Dice Component -->
      <div v-else-if="diceMode === 'attack' && !attackResults">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold">Attack Dice</h2>
              <UButton
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="ghost"
                @click="reset"
              >
                Back
              </UButton>
            </div>
          </template>

          <GameAttackDice :initial-count="3" @complete="handleAttackComplete" />
        </UCard>
      </div>

      <!-- Defense Dice Component -->
      <div v-else-if="diceMode === 'defense' && !defenseResults">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold">Defense Dice</h2>
              <UButton
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="ghost"
                @click="reset"
              >
                Back
              </UButton>
            </div>
          </template>

          <GameDefenseDice
            :initial-count="3"
            @complete="handleDefenseComplete"
          />
        </UCard>
      </div>

      <!-- Attack Results Display -->
      <div v-else-if="attackResults" class="results-display max-w-2xl mx-auto">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold">Attack Results</h2>
              <UButton
                icon="i-heroicons-arrow-path"
                color="gray"
                @click="reset"
              >
                Roll Again
              </UButton>
            </div>
          </template>

          <div class="results-grid">
            <div class="totals-section mb-6">
              <h3 class="text-lg font-semibold mb-3">Totals</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="stat-card">
                  <span class="xwing-miniatures-ship text-3xl text-red-500"
                    >d</span
                  >
                  <span class="text-2xl font-bold">{{
                    attackTotals?.hits
                  }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Hits</span
                  >
                </div>
                <div class="stat-card">
                  <span class="xwing-miniatures-ship text-3xl text-red-600"
                    >c</span
                  >
                  <span class="text-2xl font-bold">{{
                    attackTotals?.crits
                  }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Crits</span
                  >
                </div>
                <div class="stat-card">
                  <span class="xwing-miniatures-ship text-3xl text-blue-500"
                    >f</span
                  >
                  <span class="text-2xl font-bold">{{
                    attackTotals?.focus
                  }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Focus</span
                  >
                </div>
                <div class="stat-card">
                  <span class="text-2xl font-bold">{{
                    attackTotals?.blanks
                  }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Blanks</span
                  >
                </div>
              </div>
            </div>

            <div class="raw-data">
              <h3 class="text-lg font-semibold mb-3">Raw Data</h3>
              <pre
                class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto"
                >{{ JSON.stringify(attackResults, null, 2) }}</pre
              >
            </div>
          </div>
        </UCard>
      </div>

      <!-- Defense Results Display -->
      <div v-else-if="defenseResults" class="results-display max-w-2xl mx-auto">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold">Defense Results</h2>
              <UButton
                icon="i-heroicons-arrow-path"
                color="gray"
                @click="reset"
              >
                Roll Again
              </UButton>
            </div>
          </template>

          <div class="results-grid">
            <div class="totals-section mb-6">
              <h3 class="text-lg font-semibold mb-3">Totals</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="stat-card">
                  <span class="xwing-miniatures-ship text-3xl text-green-500"
                    >e</span
                  >
                  <span class="text-2xl font-bold">{{
                    defenseTotals?.evades
                  }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Evades</span
                  >
                </div>
                <div class="stat-card">
                  <span class="xwing-miniatures-ship text-3xl text-blue-500"
                    >f</span
                  >
                  <span class="text-2xl font-bold">{{
                    defenseTotals?.focus
                  }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Focus</span
                  >
                </div>
                <div class="stat-card">
                  <span class="text-2xl font-bold">{{
                    defenseTotals?.blanks
                  }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Blanks</span
                  >
                </div>
              </div>
            </div>

            <div class="raw-data">
              <h3 class="text-lg font-semibold mb-3">Raw Data</h3>
              <pre
                class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto"
                >{{ JSON.stringify(defenseResults, null, 2) }}</pre
              >
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--ui-bg-elevated);
  border-radius: 0.5rem;
  border: 1px solid var(--ui-border);
}
</style>
