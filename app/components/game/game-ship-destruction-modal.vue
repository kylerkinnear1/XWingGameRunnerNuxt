<template>
  <Teleport to="body">
    <Transition name="destruction">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        @click.self="handleClose"
      >
        <div class="relative">
          <!-- Pilot Card Image with Destruction Effects -->
          <div
            v-if="pilot && pilot.cardImageUrl"
            class="relative transition-all duration-1000"
            :class="animationClass"
          >
            <!-- The actual pilot card image -->
            <img
              v-if="pilot?.cardImageUrl"
              :src="pilot.cardImageUrl"
              :alt="pilot.pilotName"
              class="w-80 h-auto rounded-lg shadow-2xl"
            />

            <!-- Fire/Burn overlay -->
            <div v-if="isBurning" class="absolute inset-0 pointer-events-none">
              <!-- Orange/red burning gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-orange-600 via-red-500 to-transparent opacity-0 animate-burn-in rounded-lg"
              ></div>

              <!-- Flickering flames at bottom -->
              <div class="absolute bottom-0 left-0 right-0 h-1/3">
                <div class="flame flame-1"></div>
                <div class="flame flame-2"></div>
                <div class="flame flame-3"></div>
              </div>

              <!-- Smoke/fade effect -->
              <div
                class="absolute inset-0 bg-black opacity-0 animate-fade-out rounded-lg"
              ></div>
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
import type { PilotDto } from "#shared/cards";

interface Props {
  isVisible: boolean;
  pilot: PilotDto | undefined;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const animationClass = ref("");
const isBurning = ref(false);
const showCloseButton = ref(false);

watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      showCloseButton.value = false;
      animationClass.value = "";
      isBurning.value = false;

      // Start the destruction sequence
      setTimeout(() => {
        animationClass.value = "scale-110 shake";
      }, 300);

      setTimeout(() => {
        isBurning.value = true;
      }, 800);

      setTimeout(() => {
        animationClass.value = "scale-90 opacity-60";
      }, 1500);

      setTimeout(() => {
        animationClass.value = "scale-75 opacity-20";
      }, 2200);

      // Show close button after animation
      setTimeout(() => {
        showCloseButton.value = true;
      }, 2800);
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

/* Shake animation */
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
    transform: translateX(-8px) scale(1.1);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(8px) scale(1.1);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

/* Burn-in animation for the overlay */
@keyframes burn-in {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.9;
  }
}

.animate-burn-in {
  animation: burn-in 1s ease-in forwards;
}

/* Fade out to black */
@keyframes fade-out {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.7;
  }
}

.animate-fade-out {
  animation: fade-out 1.5s ease-in forwards;
  animation-delay: 0.5s;
}

/* Simple flickering flames */
@keyframes flicker {
  0%,
  100% {
    opacity: 0.7;
    transform: translateY(0) scaleY(1);
  }
  25% {
    opacity: 0.5;
    transform: translateY(-10px) scaleY(1.1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) scaleY(0.95);
  }
  75% {
    opacity: 0.6;
    transform: translateY(-12px) scaleY(1.05);
  }
}

.flame {
  position: absolute;
  bottom: 0;
  width: 50px;
  height: 60px;
  background: linear-gradient(
    to top,
    rgba(255, 80, 0, 0.8) 0%,
    rgba(255, 150, 0, 0.6) 40%,
    rgba(255, 200, 0, 0.3) 70%,
    transparent 100%
  );
  border-radius: 50% 50% 0 0;
  filter: blur(6px);
  animation: flicker 0.3s ease-in-out infinite;
}

.flame-1 {
  left: 15%;
  animation-delay: 0s;
}

.flame-2 {
  left: 45%;
  animation-delay: 0.1s;
  height: 70px;
}

.flame-3 {
  right: 15%;
  animation-delay: 0.15s;
  height: 55px;
}
</style>
