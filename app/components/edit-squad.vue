<script setup lang="ts">
import type { SquadUpdateDto, SquadUpdateResponseDto } from '#shared/squad-dto';
import { Faction, factionOptions } from '#shared/enums';
import { STAT_ICONS, getShipIcon } from '#shared/xwing-icons';

const { selectedSquad, formPilots, removePilot, refreshList, pointLimit } = useSquadEditor();
const { cards } = useCards();

const form = ref<{ name: string; faction: Faction }>({
    name: '',
    faction: Faction.Rebel
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const isEditing = computed(() => !!selectedSquad.value);

const pilotDetails = computed(() => {
    if (!cards.value) return [];
    return formPilots.value.map(pilot => {
        const card = cards.value!.pilots.find(p => p.id === pilot.pilotId);
        return {
            pilot,
            card
        };
    });
});

// Calculate total points live
const squadPoints = computed(() => {
    if (!cards.value) return { total: 0, isOverLimit: false };
    
    let total = 0;
    
    formPilots.value.forEach(pilot => {
        const card = cards.value!.pilots.find(p => p.id === pilot.pilotId);
        if (card) {
            total += card.points;
            
            // Add upgrade points
            pilot.upgradeIds?.forEach(upgradeId => {
                const upgrade = cards.value!.upgrades.find(u => u.id === upgradeId);
                if (upgrade) {
                    total += upgrade.points;
                }
            });
        }
    });
    
    return {
        total,
        isOverLimit: total > pointLimit.value
    };
});

watch(selectedSquad, (squad) => {
    if (squad) {
        form.value = {
            name: squad.name,
            faction: squad.faction
        };
        error.value = null;
        success.value = false;
    }
}, { immediate: true });

async function saveSquad() {
    error.value = null;
    success.value = false;
    loading.value = true;

    try {
        const body: SquadUpdateDto = {
            name: form.value.name,
            faction: form.value.faction,
            pilots: formPilots.value
        };
        
        await $fetch(`/api/squads/${selectedSquad.value!.id}`, {
            method: 'PUT',
            body
        });
    
        success.value = true;
    
        await refreshList();
    } catch (e: any) {
        error.value = e.data?.message || 'Failed to save squad';
    } finally {
        loading.value = false;
    }
}

function handleRemovePilot(pilotId: string) {
    removePilot(pilotId);
}
</script>
<template>
    <div class="h-full flex flex-col bg-gray-900">
    <div class="p-4 border-b border-gray-700 bg-gray-800">
      <div class="flex items-baseline justify-between">
        <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">
          {{ isEditing ? 'Squad Editor' : 'No Squad Selected' }}
        </h2>
        <div v-if="isEditing" class="flex items-baseline gap-2">
          <span 
            class="text-2xl font-bold"
            :class="squadPoints.isOverLimit ? 'text-red-400' : 'text-teal-400'"
          >
            {{ squadPoints.total }}
          </span>
          <span class="text-sm text-gray-500">/</span>
          <span class="text-sm text-gray-400">{{ pointLimit }}</span>
        </div>
      </div>
    </div>

    <div v-if="!isEditing" class="flex-1 flex items-center justify-center text-gray-400 text-sm">
        <div class="text-center">
        <p class="mb-2">No squad selected</p>
        <p class="text-xs text-gray-500">Select a squad from the list or create a new one</p>
        </div>
    </div>

    <form v-else @submit.prevent="saveSquad" class="flex-1 overflow-y-auto">
    <div class="p-4 space-y-4">
        <div>
        <label for="name" class="block text-xs font-medium mb-1.5 uppercase tracking-wide text-gray-400">
            Squad Name
        </label>
        <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-800 text-gray-100"
            placeholder="Enter squad name"
        />
        </div>

        <!-- Pilots Section -->
        <div>
        <label class="block text-xs font-medium mb-2 uppercase tracking-wide text-gray-400">
            Pilots ({{ formPilots.length }})
        </label>
        <div v-if="formPilots.length === 0" class="text-sm text-gray-500 italic p-6 border-2 border-dashed border-gray-700 bg-gray-800 text-center">
            No pilots added yet. Select a ship and click "ADD" on a pilot.
        </div>
        <div v-else class="space-y-2">
            <div
            v-for="{ pilot, card } in pilotDetails"
            :key="pilot.pilotId"
            class="flex items-start gap-3 p-3 border border-gray-700 hover:bg-gray-800 group"
            >
            <span class="xwing-ship text-3xl text-gray-300 shrink-0">
                {{ getShipIcon(card?.shipType || '') }}
            </span>
            
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                <span v-if="card?.isUnique" class="xwing-icon text-yellow-500 text-xs">u</span>
                <span class="font-semibold text-sm text-gray-100">{{ card?.pilotName || pilot.pilotId }}</span>
                <span class="text-xs text-gray-500">PS {{ card?.pilotSkill || '?' }}</span>
                </div>
                
                <div class="flex gap-3 text-xs mb-1">
                <span class="flex items-center gap-0.5 text-gray-300">
                    <span class="xwing-icon text-red-500 text-sm">{{ STAT_ICONS.attack }}</span>
                    <span class="font-medium">{{ card?.attack }}</span>
                </span>
                <span class="flex items-center gap-0.5 text-gray-300">
                    <span class="xwing-icon text-green-500 text-sm">{{ STAT_ICONS.agility }}</span>
                    <span class="font-medium">{{ card?.agility }}</span>
                </span>
                <span class="flex items-center gap-0.5 text-gray-300">
                    <span class="xwing-icon text-gray-400 text-sm">{{ STAT_ICONS.hull }}</span>
                    <span class="font-medium">{{ card?.hull }}</span>
                </span>
                <span class="flex items-center gap-0.5 text-gray-300">
                    <span class="xwing-icon text-blue-500 text-sm">{{ STAT_ICONS.shield }}</span>
                    <span class="font-medium">{{ card?.shields }}</span>
                </span>
                </div>
                
                <div class="text-xs text-gray-400">
                <span class="font-bold text-teal-400">{{ card?.points || 0 }}</span> points
                </div>
            </div>
            
            <button
                type="button"
                @click="handleRemovePilot(pilot.pilotId)"
                class="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-900 transition-all shrink-0"
            >
                REMOVE
            </button>
            </div>
        </div>
        </div>

        <div v-if="error" class="p-3 bg-red-900 border border-red-700 text-red-200 text-sm">
        {{ error }}
        </div>

        <div v-if="success" class="p-3 bg-green-900 border border-green-700 text-green-200 text-sm">
        Squad updated successfully!
        </div>

        <div class="flex gap-4 pt-2">
        <button
            type="submit"
            :disabled="loading || !form.name"
            class="px-6 py-2 text-sm font-bold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
        >
            {{ loading ? 'Saving...' : 'Save Squad' }}
        </button>
        </div>
    </div>
    </form>
    </div>
</template>