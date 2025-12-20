<script setup lang="ts">
import type { PilotDto } from '#shared/cards';

interface ShipGroup {
    shipKey: string;
    shipName: string;
    pilots: PilotDto[];
}

const { selectedSquad } = useSquadEditor();

// Properly type the composable
const cardsComposable = useCards();

// State for ship groups - using array instead of Map for better reactivity
const shipGroups = ref<ShipGroup[]>([]);
const expandedShips = ref<string[]>([]);
const hoveredPilot = ref<PilotDto | null>(null);
const hoverPosition = ref({ x: 0, y: 0 });
const loadError = ref<string | null>(null);
const isLoading = ref(true);

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

// Update ship groups when squad changes
watch(selectedSquad, (squad) => {
    try {
    if (squad) {
        console.log('Loading ships for squad:', squad.name, squad.faction);
        const pilots = cardsComposable.getPilotsForFaction(squad.faction);
        const grouped = cardsComposable.groupPilotsByShip(pilots);
        
        // Convert Map to array of objects with proper typing
        shipGroups.value = Array.from(grouped.entries()).map(
        ([shipKey, pilots]: [string, PilotDto[]]) => ({
            shipKey,
            shipName: pilots[0]?.shipType || 'Unknown Ship',
            pilots
        })
        );
        
        console.log('Ship groups loaded:', shipGroups.value.length);
    } else {
        shipGroups.value = [];
    }
    } catch (error) {
    console.error('Error updating ship groups:', error);
    loadError.value = 'Failed to load ships';
    }
}, { immediate: true });

function toggleShip(shipKey: string) {
    const index = expandedShips.value.indexOf(shipKey);
    if (index > -1) {
    expandedShips.value.splice(index, 1);
    } else {
    expandedShips.value.push(shipKey);
    }
}

function isShipExpanded(shipKey: string): boolean {
    return expandedShips.value.includes(shipKey);
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

function addPilotToSquad(pilot: PilotDto) {
    // TODO: Implement adding pilot to squad
    console.log('Adding pilot to squad:', pilot);
}
</script>

<template>
    <div class="border rounded-lg bg-white">
    <div class="p-4 border-b bg-gray-50">
        <h2 class="text-xl font-bold">Ship Selection</h2>
        <p v-if="selectedSquad" class="text-sm text-gray-600 mt-1">
        {{ selectedSquad.name }}
        </p>
    </div>

    <div v-if="!selectedSquad" class="p-8 text-center text-gray-500">
        Select a squad to view available ships
    </div>

    <div v-else-if="loadError" class="p-8 text-center">
        <div class="text-red-600 mb-2">{{ loadError }}</div>
        <p class="text-sm text-gray-500">Make sure cards.json exists in the public folder</p>
    </div>

    <div v-else-if="isLoading" class="p-8 text-center text-gray-500">
        Loading ships...
    </div>

    <div v-else-if="shipGroups.length === 0" class="p-8 text-center text-gray-500">
        No ships available for this faction
    </div>

    <div v-else class="divide-y max-h-[600px] overflow-y-auto">
        <div
        v-for="group in shipGroups"
        :key="group.shipKey"
        class="border-b last:border-b-0"
        >
        <!-- Ship Header -->
        <button
            @click="toggleShip(group.shipKey)"
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
            <div class="flex items-center gap-2">
            <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-90': isShipExpanded(group.shipKey) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
                />
            </svg>
            <span class="font-semibold">{{ group.shipName }}</span>
            </div>
            <span class="text-sm text-gray-500">{{ group.pilots.length }} pilots</span>
        </button>

        <!-- Pilot List -->
        <div
            v-show="isShipExpanded(group.shipKey)"
            class="bg-gray-50"
        >
            <div
            v-for="pilot in group.pilots"
            :key="pilot.id"
            class="px-4 py-2 hover:bg-white transition-colors border-t border-gray-200 cursor-pointer flex items-center justify-between group"
            @mouseenter="handlePilotHover(pilot, $event)"
            @mousemove="handlePilotHover(pilot, $event)"
            @mouseleave="handlePilotLeave"
            @click="addPilotToSquad(pilot)"
            >
            <div class="flex-1">
                <div class="text-sm">
                <span v-if="pilot.isUnique" class="text-yellow-600 mr-1">•</span>
                <span class="font-medium">{{ pilot.pilotName }}</span>
                <span class="text-gray-600 ml-2">[PS {{ pilot.pilotSkill }}]</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                <span class="mr-3">⚔️ {{ pilot.attack }}</span>
                <span class="mr-3">🛡️ {{ pilot.agility }}</span>
                <span class="mr-3">💚 {{ pilot.hull }}</span>
                <span>🔵 {{ pilot.shields }}</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-green-600">{{ pilot.points }}</span>
                <button
                class="opacity-0 group-hover:opacity-100 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-all"
                @click.stop="addPilotToSquad(pilot)"
                >
                Add
                </button>
            </div>
            </div>
        </div>
        </div>
    </div>

    <!-- Card Image Tooltip -->
    <Teleport to="body">
        <div
        v-if="hoveredPilot && hoveredPilot.cardImageUrl"
        class="fixed z-50 pointer-events-none"
        :style="{
            left: `${hoverPosition.x + 20}px`,
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
    </div>
</template>