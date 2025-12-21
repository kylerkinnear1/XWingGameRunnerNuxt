<script setup lang="ts">
import type { GameStepDto } from "#shared/game-state-dto";

const props = defineProps<{
  steps: GameStepDto[];
  selectedIndex: number;
  loading?: boolean;
  error?: boolean;
}>();

const emit = defineEmits<{
  selectStep: [index: number];
}>();

function handleStepClick(index: number) {
  emit("selectStep", index);
}
</script>

<template>
  <div
    class="w-64 shrink-0 border-r border-gray-700 bg-gray-800 overflow-y-auto flex flex-col"
  >
    <div class="p-4 border-b border-gray-700 bg-gray-900">
      <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">
        Game Steps
      </h2>
      <p class="text-xs text-gray-500 mt-1">Click to replay to step</p>
    </div>

    <div v-if="loading" class="p-4 text-gray-400 text-sm">Loading game...</div>

    <div v-else-if="error" class="p-4 text-red-400 text-sm">
      Failed to load game
    </div>

    <div v-else class="p-2 flex-1 overflow-y-auto">
      <div
        v-for="(step, index) in steps"
        :key="index"
        @click="handleStepClick(index)"
        class="p-3 mb-1 border cursor-pointer transition-all"
        :class="[
          selectedIndex === index
            ? 'border-teal-500 bg-gray-700 border-l-4'
            : 'border-gray-700 bg-gray-800 hover:bg-gray-750 border-l-2',
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold text-gray-100 truncate">
              {{ step.type.replace(/_/g, " ").toUpperCase() }}
            </div>
            <div class="text-xs text-gray-500">Step {{ index + 1 }}</div>
          </div>
          <div class="text-xs text-gray-600">
            {{ new Date(step.timestamp).toLocaleTimeString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
