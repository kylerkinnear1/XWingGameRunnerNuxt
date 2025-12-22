<script setup lang="ts">
const emit = defineEmits<{
  endTurn: [];
}>();

const animationPhase = ref<"initial" | "visible" | "complete">("initial");
const showButton = ref(false);

onMounted(() => {
  setTimeout(() => (animationPhase.value = "visible"), 100);
  setTimeout(() => {
    animationPhase.value = "complete";
    setTimeout(() => (showButton.value = true), 500);
  }, 2000);
});

function handleEndTurn() {
  emit("endTurn");
}
</script>

<template>
  <div
    class="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative"
  >
    <div class="absolute inset-0 opacity-20">
      <div
        v-for="i in 50"
        :key="i"
        class="absolute bg-white rounded-full animate-pulse"
        :style="{
          width: `${Math.random() * 3}px`,
          height: `${Math.random() * 3}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
        }"
      />
    </div>

    <div class="relative z-10 text-center">
      <div
        class="transition-all duration-1000 ease-out mb-8"
        :class="[
          animationPhase === 'initial'
            ? 'scale-0 opacity-0'
            : animationPhase === 'complete'
            ? 'scale-100 opacity-100'
            : 'scale-100 opacity-100',
        ]"
      >
        <div
          class="text-9xl font-black text-amber-500 drop-shadow-2xl mb-4"
          style="text-shadow: 0 0 30px rgba(245, 158, 11, 0.5)"
        >
          CLEANUP
        </div>
        <div class="text-3xl font-bold text-gray-400">End of Turn</div>
      </div>

      <Transition name="fade-in">
        <button
          v-if="showButton"
          class="end-turn-button"
          @click="handleEndTurn"
        >
          End Turn
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.end-turn-button {
  padding: 1rem 3rem;
  font-size: 1.5rem;
  font-weight: 700;
  background-color: rgb(245 158 11);
  color: white;
  border-bottom: 4px solid rgb(180 83 9);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 250px;
  border-radius: 0.5rem;
  cursor: pointer;
}

.end-turn-button:hover {
  background-color: rgb(251 191 36);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.end-turn-button:active {
  border-bottom-width: 2px;
  transform: translateY(2px);
}

.fade-in-enter-active {
  transition: opacity 0.5s ease-out;
}

.fade-in-enter-from {
  opacity: 0;
}

.fade-in-enter-to {
  opacity: 1;
}
</style>

