<script setup lang="ts">
import type { PilotDto } from '#shared/cards';
import { SHIP_ICONS, STAT_ICONS, getShipIcon } from '#shared/xwing-icons';

interface ShipGroup {
    shipKey: string;
    shipName: string;
    pilots: PilotDto[];
}

const { selectedSquad } = useSquadEditor();

const cardsComposable = useCards();

const shipGroups = ref<ShipGroup[]>([]);
const selectedShip = ref<ShipGroup | null>(null);
const hoveredPilot = ref<PilotDto | null>(null);
const hoverPosition = ref({ x: 0, y: 0 });
const loadError = ref<string | null>(null);
const isLoading = ref(true);

const isDrawerOpen = computed(() => !!selectedShip.value);

// Load cards on mount
onMounted(async () => {
    try {
    await cardsComposable.loadCards();
    console.log('Cards loaded in component');
    } catch (error) {
    console.error('Failed to load cards:', error);
    loadError.value = 'Failed to load card data';
    } finally {
    isLoading.value = false;
    }
});

watch(selectedSquad, (squad) => {
    try {
    if (squad) {
        const pilots = cardsComposable.getPilotsForFaction(squad.faction);
        const grouped = cardsComposable.groupPilotsByShip(pilots);
        
        shipGroups.value = Array.from(grouped.entries()).map(
        ([shipKey, pilots]: [string, PilotDto[]]) => ({
            shipKey,
            shipName: pilots[0]?.shipType || 'Unknown Ship',
            pilots
        })
        );
    } else {
        shipGroups.value = [];
        selectedShip.value = null;
        isDrawerOpen.value = false;
    }
    } catch (error) {
    console.error('Error updating ship groups:', error);
    loadError.value = 'Failed to load ships';
    }
}, { immediate: true });

function openShipDrawer(group: ShipGroup) {
    selectedShip.value = group;
}

function closeDrawer() {
    selectedShip.value = null;
}

function handlePilotHover(pilot: PilotDto, event: MouseEvent) {
    hoveredPilot.value = pilot;
    hoverPosition.value = {
    x: event.clientX,
    y: event.clientY
    };
}

function handlePilotLeave() {
    hoveredPilot.value = null;
}

const { addPilot } = useSquadEditor();

function addPilotToSquad(pilot: PilotDto) {
    addPilot(pilot.id);
}
</script>

<template>
  <div class="h-full flex">
    <!-- Ship Grid -->
    <div class="w-80 flex-shrink-0 flex flex-col bg-gray-800">
      <div class="p-4 border-b border-gray-700 bg-gray-900">
        <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">Ship Selection</h2>
        <p v-if="selectedSquad" class="text-xs text-gray-500 mt-1">
          {{ selectedSquad.name }}
        </p>
      </div>

      <div v-if="loadError" class="p-8 text-center">
        <div class="text-red-400 text-sm mb-2">{{ loadError }}</div>
        <p class="text-xs text-gray-500">Make sure cards.json exists in the public folder</p>
      </div>

      <div v-else-if="isLoading" class="p-8 text-center text-gray-400 text-sm">
        Loading ships...
      </div>

      <div v-else-if="shipGroups.length === 0" class="p-8 text-center text-gray-400 text-sm">
        No ships available
      </div>

      <div v-else class="flex-1 overflow-y-auto p-2">
        <div class="flex flex-col gap-2">
          <button
            v-for="group in shipGroups"
            :key="group.shipKey"
            @click="openShipDrawer(group)"
            class="flex items-center gap-3 p-2 border border-gray-700 hover:bg-gray-700 hover:border-teal-500 transition-all group relative"
            :class="{ 'bg-gray-700 border-teal-500 border-2': selectedShip?.shipKey === group.shipKey }"
          >
            <span class="xwing-ship text-2xl text-gray-300 group-hover:text-teal-400 transition-colors shrink-0">
              {{ getShipIcon(group.shipName) }}
            </span>
            <span class="text-xs text-gray-400 leading-tight font-medium flex-1 text-left">
              {{ group.shipName }}
            </span>
            <span class="text-xs bg-gray-900 text-gray-300 px-2 py-0.5 font-semibold shrink-0">
              {{ group.pilots.length }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pilot Drawer - slides next to ship drawer -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isDrawerOpen && selectedShip"
        class="w-96 flex-shrink-0 border-r border-gray-700 bg-gray-800 flex flex-col"
      >
        <div class="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="xwing-ship text-4xl text-gray-300">
              {{ getShipIcon(selectedShip.shipName) }}
            </span>
            <div>
              <h3 class="font-bold text-base text-gray-100">{{ selectedShip.shipName }}</h3>
              <p class="text-xs text-gray-500">{{ selectedShip.pilots.length }} pilots</p>
            </div>
          </div>
          <button
            @click="closeDrawer"
            class="p-2 hover:bg-gray-700 transition-colors rounded text-gray-400 hover:text-gray-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div
            v-for="pilot in selectedShip.pilots"
            :key="pilot.id"
            class="p-4 hover:bg-gray-700 transition-colors border-b border-gray-700 cursor-pointer group"
            @mouseenter="handlePilotHover(pilot, $event)"
            @mousemove="handlePilotHover(pilot, $event)"
            @mouseleave="handlePilotLeave"
            @click="addPilotToSquad(pilot)"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="text-sm font-semibold text-gray-100">
                  <span v-if="pilot.isUnique" class="xwing-icon text-yellow-500 mr-1 text-xs">u</span>
                  {{ pilot.pilotName }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">PS {{ pilot.pilotSkill }}</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-teal-400 text-sm">{{ pilot.points }}</span>
                <button
                  class="opacity-0 group-hover:opacity-100 px-3 py-1 bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all"
                  @click.stop="addPilotToSquad(pilot)"
                >
                  ADD
                </button>
              </div>
            </div>

            <div class="flex gap-3 text-xs mb-2">
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-red-500 text-sm">{{ STAT_ICONS.attack }}</span>
                <span class="font-medium">{{ pilot.attack }}</span>
              </span>
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-green-500 text-sm">{{ STAT_ICONS.agility }}</span>
                <span class="font-medium">{{ pilot.agility }}</span>
              </span>
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-gray-400 text-sm">{{ STAT_ICONS.hull }}</span>
                <span class="font-medium">{{ pilot.hull }}</span>
              </span>
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-blue-500 text-sm">{{ STAT_ICONS.shield }}</span>
                <span class="font-medium">{{ pilot.shields }}</span>
              </span>
            </div>

            <div v-if="pilot.ability" class="text-xs text-gray-400 italic leading-relaxed">
              {{ pilot.ability }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>

    <!-- Card Image Tooltip -->
  <Teleport to="body">
    <div
      v-if="hoveredPilot && hoveredPilot.cardImageUrl"
      class="fixed z-[60] pointer-events-none"
      :style="{
        left: `${hoverPosition.x + 300}px`,
        top: `${hoverPosition.y - 100}px`
      }"
    >
      <img
        :src="hoveredPilot.cardImageUrl"
        :alt="hoveredPilot.pilotName"
        class="w-64 rounded-lg shadow-2xl border-2 border-gray-300"
      />
    </div>
  </Teleport>
</template>