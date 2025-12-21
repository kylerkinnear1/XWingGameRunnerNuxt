<script setup lang="ts">
import type { SquadReadDto } from "#shared/squad-dto";
import { getShipIcon, FACTION_ICONS } from "#shared/xwing-icons";

const props = defineProps<{
  player1Squad: SquadReadDto;
  player2Squad: SquadReadDto;
}>();

const emit = defineEmits<{
  start: [];
}>();

const { cards } = useCards();

const animationPhase = ref<"initial" | "squadsIn" | "vsIn" | "ready">(
  "initial"
);

// Calculate squad points
const getSquadPoints = (squad: SquadReadDto) => {
  if (!cards.value) return 0;

  let total = 0;
  squad.ships.forEach((ship) => {
    const pilot = cards.value!.pilots.find((p) => p.id === ship.pilotId);
    if (pilot) {
      total += pilot.points;
      ship.upgradeIds?.forEach((upgradeId) => {
        const upgrade = cards.value!.upgrades.find((u) => u.id === upgradeId);
        if (upgrade) {
          total += upgrade.points;
        }
      });
    }
  });
  return total;
};

const player1Ships = computed(() => {
  if (!cards.value) return [];
  return props.player1Squad.ships.map((ship) => {
    const pilot = cards.value!.pilots.find((p) => p.id === ship.pilotId);
    return {
      pilotName: pilot?.pilotName || "Unknown",
      shipType: pilot?.shipType || "",
      pilotSkill: pilot?.pilotSkill || 0,
    };
  });
});

const player2Ships = computed(() => {
  if (!cards.value) return [];
  return props.player2Squad.ships.map((ship) => {
    const pilot = cards.value!.pilots.find((p) => p.id === ship.pilotId);
    return {
      pilotName: pilot?.pilotName || "Unknown",
      shipType: pilot?.shipType || "",
      pilotSkill: pilot?.pilotSkill || 0,
    };
  });
});

onMounted(() => {
  setTimeout(() => (animationPhase.value = "squadsIn"), 100);
  setTimeout(() => (animationPhase.value = "vsIn"), 1000);
  setTimeout(() => (animationPhase.value = "ready"), 2000);
});

function handleStart() {
  emit("start");
}
</script>

<template>
  <div
    class="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative"
  >
    <!-- Background stars effect -->
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

    <div class="relative z-10 w-full max-w-7xl px-8">
      <div class="grid grid-cols-3 gap-8 items-center">
        <!-- Player 1 Squad -->
        <div
          class="transition-all duration-1000 ease-out"
          :class="[
            animationPhase === 'initial'
              ? '-translate-y-96 opacity-0'
              : 'translate-y-0 opacity-100',
          ]"
        >
          <div
            class="bg-gray-800/80 backdrop-blur border-2 border-red-900 p-6 shadow-2xl"
          >
            <!-- Faction Icon & Name -->
            <div
              class="flex items-center gap-3 mb-4 pb-4 border-b border-red-900"
            >
              <span class="xwing-icon text-4xl text-red-500">
                {{ FACTION_ICONS[player1Squad.faction] }}
              </span>
              <div class="flex-1">
                <h3 class="font-bold text-xl text-gray-100">
                  {{ player1Squad.name }}
                </h3>
                <p class="text-sm text-gray-400">
                  {{ getSquadPoints(player1Squad) }} points
                </p>
              </div>
            </div>

            <!-- Ship List -->
            <div class="space-y-2">
              <div
                v-for="(ship, index) in player1Ships"
                :key="index"
                class="flex items-center gap-3 p-2 bg-gray-900/50 border border-gray-700"
                :style="{ animationDelay: `${index * 100}ms` }"
              >
                <span class="xwing-ship text-3xl text-red-400">
                  {{ getShipIcon(ship.shipType) }}
                </span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-gray-100 truncate">
                    {{ ship.pilotName }}
                  </div>
                  <div class="text-xs text-gray-500">
                    PS {{ ship.pilotSkill }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- VS Center -->
        <div
          class="flex items-center justify-center transition-all duration-1000 ease-out"
          :class="[
            animationPhase === 'vsIn' || animationPhase === 'ready'
              ? 'scale-100 opacity-100'
              : 'scale-0 opacity-0',
          ]"
        >
          <div class="text-center">
            <div
              class="text-8xl font-black text-teal-500 drop-shadow-2xl tracking-wider mb-6"
              style="text-shadow: 0 0 30px rgba(20, 184, 166, 0.5)"
            >
              VS
            </div>

            <!-- Start Button -->
            <button
              v-if="animationPhase === 'ready'"
              @click="handleStart"
              class="px-12 py-4 text-xl font-bold bg-teal-600 text-white border-b-8 border-teal-800 hover:bg-teal-500 active:border-b-4 transition-all uppercase tracking-wider shadow-2xl hover:shadow-teal-500/50 animate-pulse"
            >
              Start Battle
            </button>
          </div>
        </div>

        <!-- Player 2 Squad -->
        <div
          class="transition-all duration-1000 ease-out"
          :class="[
            animationPhase === 'initial'
              ? 'translate-y-96 opacity-0'
              : 'translate-y-0 opacity-100',
          ]"
        >
          <div
            class="bg-gray-800/80 backdrop-blur border-2 border-gray-600 p-6 shadow-2xl"
          >
            <!-- Faction Icon & Name -->
            <div
              class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-600"
            >
              <span class="xwing-icon text-4xl text-gray-400">
                {{ FACTION_ICONS[player2Squad.faction] }}
              </span>
              <div class="flex-1">
                <h3 class="font-bold text-xl text-gray-100">
                  {{ player2Squad.name }}
                </h3>
                <p class="text-sm text-gray-400">
                  {{ getSquadPoints(player2Squad) }} points
                </p>
              </div>
            </div>

            <!-- Ship List -->
            <div class="space-y-2">
              <div
                v-for="(ship, index) in player2Ships"
                :key="index"
                class="flex items-center gap-3 p-2 bg-gray-900/50 border border-gray-700"
                :style="{ animationDelay: `${index * 100}ms` }"
              >
                <span class="xwing-ship text-3xl text-gray-300">
                  {{ getShipIcon(ship.shipType) }}
                </span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-gray-100 truncate">
                    {{ ship.pilotName }}
                  </div>
                  <div class="text-xs text-gray-500">
                    PS {{ ship.pilotSkill }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Battle Info -->
      <div
        v-if="animationPhase === 'ready'"
        class="mt-8 text-center text-gray-400 text-sm animate-fade-in"
      ></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}
</style>
