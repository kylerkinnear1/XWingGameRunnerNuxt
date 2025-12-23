<script setup lang="ts">
const emit = defineEmits<{
  complete: [];
}>();

const animationPhase = ref<"initial" | "visible" | "complete">("initial");

onMounted(() => {
  setTimeout(() => (animationPhase.value = "visible"), 100);
  setTimeout(() => {
    animationPhase.value = "complete";
    setTimeout(() => emit("complete"), 500);
  }, 2000);
});
</script>

<template>
  <div
    class="h-full flex items-center justify-center overflow-hidden relative z-10"
  >
    <div class="relative z-10 text-center">
      <div
        class="transition-all duration-1000 ease-out"
        :class="[
          animationPhase === 'initial'
            ? 'scale-0 opacity-0'
            : animationPhase === 'complete'
            ? 'scale-150 opacity-0'
            : 'scale-100 opacity-100',
        ]"
      >
        <div
          class="text-9xl font-black text-red-500 drop-shadow-2xl mb-4"
          style="text-shadow: 0 0 30px rgba(239, 68, 68, 0.5)"
        >
          COMBAT
        </div>
        <div class="text-3xl font-bold text-gray-400">Engagement Phase</div>
      </div>
    </div>
  </div>
</template>
