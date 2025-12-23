<template>
  <Teleport to="body">
    <Transition name="destruction">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click.self="handleClose"
      >
        <div class="relative w-full max-w-md">
          <!-- Ship Card with Burning Effect -->
          <div
            class="relative transform transition-all duration-1000"
            :class="animationClass"
          >
            <!-- Ship Card Display -->
            <div
              class="ship-card-container relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-2xl"
            >
              <!-- Burning overlay effects -->
              <div class="fire-overlay absolute inset-0 pointer-events-none">
                <div class="flame flame-1"></div>
                <div class="flame flame-2"></div>
                <div class="flame flame-3"></div>
                <div class="embers"></div>
              </div>

              <!-- Ship Info -->
              <div class="relative z-10 text-white">
                <h2 class="text-2xl font-bold mb-2">{{ shipName }}</h2>
                <p class="text-lg mb-4">{{ pilotName }}</p>
                <div class="text-6xl text-center my-8 animate-pulse">💥</div>
                <p class="text-center text-red-400 font-semibold text-xl">
                  DESTROYED
                </p>
              </div>

              <!-- Damage cracks overlay -->
              <svg
                class="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  class="crack-line"
                  d="M 10 50 L 30 20 L 60 40 L 90 10"
                  stroke="rgba(255, 100, 0, 0.6)"
                  stroke-width="2"
                  fill="none"
                />
                <path
                  class="crack-line crack-line-2"
                  d="M 80 80 L 60 60 L 70 40 L 50 30"
                  stroke="rgba(255, 150, 0, 0.5)"
                  stroke-width="1.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <!-- Close button (appears after animation) -->
          <button
            v-if="showCloseButton"
            @click="handleClose"
            class="mt-6 w-full rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  isVisible: boolean;
  shipName: string;
  pilotName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const animationClass = ref("");
const showCloseButton = ref(false);

watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      showCloseButton.value = false;
      animationClass.value = "";

      // Start the destruction animation sequence
      setTimeout(() => {
        animationClass.value = "scale-110";
      }, 100);

      setTimeout(() => {
        animationClass.value = "scale-110 shake";
      }, 500);

      setTimeout(() => {
        animationClass.value = "scale-95 opacity-80 burning";
      }, 1500);

      setTimeout(() => {
        animationClass.value = "scale-75 opacity-40 burning";
      }, 2500);

      // Show close button after animation
      setTimeout(() => {
        showCloseButton.value = true;
      }, 3000);
    }
  }
);

const handleClose = () => {
  emit("close");
};
</script>

<style scoped>
/* Modal transitions */
.destruction-enter-active,
.destruction-leave-active {
  transition: opacity 0.3s ease;
}

.destruction-enter-from,
.destruction-leave-to {
  opacity: 0;
}

/* Shake animation for impact */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0) scale(1.1);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px) scale(1.1);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px) scale(1.1);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

/* Fire effect */
@keyframes flicker {
  0%,
  100% {
    opacity: 0.8;
    transform: translateY(0) scale(1);
  }
  25% {
    opacity: 0.6;
    transform: translateY(-10px) scale(1.1);
  }
  50% {
    opacity: 0.9;
    transform: translateY(-5px) scale(0.95);
  }
  75% {
    opacity: 0.7;
    transform: translateY(-15px) scale(1.05);
  }
}

.flame {
  position: absolute;
  bottom: 0;
  width: 60px;
  height: 80px;
  background: linear-gradient(
    to top,
    rgba(255, 100, 0, 0.9) 0%,
    rgba(255, 150, 0, 0.7) 40%,
    rgba(255, 200, 0, 0.4) 70%,
    transparent 100%
  );
  border-radius: 50% 50% 0 0;
  filter: blur(8px);
  animation: flicker 0.3s ease-in-out infinite;
}

.flame-1 {
  left: 10%;
  animation-delay: 0s;
}

.flame-2 {
  left: 45%;
  animation-delay: 0.1s;
  height: 100px;
}

.flame-3 {
  right: 15%;
  animation-delay: 0.15s;
  height: 70px;
}

/* Embers effect */
@keyframes ember-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-200px) scale(0.3);
    opacity: 0;
  }
}

.embers {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
      circle,
      rgba(255, 100, 0, 0.8) 2px,
      transparent 2px
    ),
    radial-gradient(circle, rgba(255, 150, 0, 0.6) 1.5px, transparent 1.5px),
    radial-gradient(circle, rgba(255, 200, 0, 0.7) 2.5px, transparent 2.5px);
  background-size: 50px 50px, 80px 80px, 60px 60px;
  background-position: 0 0, 30px 30px, 15px 45px;
  animation: ember-rise 2s ease-out infinite;
}

/* Burning effect class */
.burning .fire-overlay {
  opacity: 1;
}

/* Crack line animation */
@keyframes crack-grow {
  from {
    stroke-dasharray: 0, 1000;
  }
  to {
    stroke-dasharray: 1000, 0;
  }
}

.crack-line {
  animation: crack-grow 0.8s ease-out forwards;
}

.crack-line-2 {
  animation-delay: 0.3s;
}

/* Glow effect when burning */
.burning .ship-card-container {
  box-shadow: 0 0 30px rgba(255, 100, 0, 0.6), 0 0 60px rgba(255, 150, 0, 0.4),
    0 0 90px rgba(255, 200, 0, 0.2);
}
</style>
