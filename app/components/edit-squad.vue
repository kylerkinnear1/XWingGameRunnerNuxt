<script setup lang="ts">
import type { SquadUpdateDto, SquadUpdateResponseDto } from '#shared/squad-dto';
import type { UpgradeDto } from '#shared/cards';
import { Faction, factionOptions } from '#shared/enums';
import { STAT_ICONS, getShipIcon, getUpgradeSlotIcon } from '#shared/xwing-icons';

const { selectedSquad, formPilots, removePilot, refreshList, pointLimit } = useSquadEditor();
const { cards } = useCards();
const { getUpgradesForSlot, getAvailableSlots, getUpgrade, canAddUpgrade, getAllUpgrades } = useUpgrades();

const form = ref<{ name: string; faction: Faction }>({
    name: '',
    faction: Faction.Rebel
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

// Custom upgrade picker state
const showCustomPicker = ref(false);
const customPickerPilotId = ref<string | null>(null);
const customPickerSearch = ref('');

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

// Filtered upgrades for custom picker
const filteredCustomUpgrades = computed(() => {
    const all = getAllUpgrades();
    if (!customPickerSearch.value.trim()) return all;
    
    const search = customPickerSearch.value.toLowerCase();
    return all.filter(u => 
        u.name.toLowerCase().includes(search) ||
        u.upgradeType.toLowerCase().includes(search)
    );
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

function addUpgradeToSlot(pilotId: string, upgradeId: string) {
    if (!upgradeId) return;
    
    const pilot = formPilots.value.find(p => p.pilotId === pilotId);
    if (pilot && !pilot.upgradeIds.includes(upgradeId)) {
        pilot.upgradeIds.push(upgradeId);
    }
}

function handleUpgradeSelect(pilotId: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
        addUpgradeToSlot(pilotId, target.value);
        target.value = '';
    }
}

function removeUpgrade(pilotId: string, upgradeId: string) {
    const pilot = formPilots.value.find(p => p.pilotId === pilotId);
    if (pilot) {
        pilot.upgradeIds = pilot.upgradeIds.filter(id => id !== upgradeId);
    }
}

function openCustomPicker(pilotId: string) {
    customPickerPilotId.value = pilotId;
    showCustomPicker.value = true;
    customPickerSearch.value = '';
}

function closeCustomPicker() {
    showCustomPicker.value = false;
    customPickerPilotId.value = null;
    customPickerSearch.value = '';
}

function addCustomUpgrade(upgradeId: string) {
    if (customPickerPilotId.value) {
        addUpgradeToSlot(customPickerPilotId.value, upgradeId);
        closeCustomPicker();
    }
}

function getSlotColor(slotType: string): string {
    const colors: Record<string, string> = {
        'Elite': 'text-yellow-500',
        'Talent': 'text-yellow-500',
        'Astromech': 'text-blue-400',
        'Torpedo': 'text-red-500',
        'Missile': 'text-orange-500',
        'Cannon': 'text-red-400',
        'Turret': 'text-purple-500',
        'Bomb': 'text-gray-400',
        'Device': 'text-gray-400',
        'Crew': 'text-green-500',
        'Modification': 'text-teal-500',
        'Tech': 'text-cyan-500',
        'Illicit': 'text-pink-500',
        'Title': 'text-amber-500',
        'System': 'text-indigo-500',
        'Sensor': 'text-indigo-400'
    };
    return colors[slotType] || 'text-gray-400';
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
        <div v-else class="space-y-3">
            <div
            v-for="{ pilot, card } in pilotDetails"
            :key="pilot.pilotId"
            class="border border-gray-700 bg-gray-800 hover:bg-gray-750 group"
            >
            <!-- Pilot Header -->
            <div class="flex items-start gap-3 p-3 border-b border-gray-700">
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

            <!-- Upgrades Section -->
            <div class="p-3 space-y-2">
                <!-- Selected Upgrades -->
                <div v-if="pilot.upgradeIds?.length > 0" class="space-y-1">
                <div
                    v-for="upgradeId in pilot.upgradeIds"
                    :key="upgradeId"
                    class="flex items-center gap-2 p-2 bg-gray-700 border border-gray-600 text-xs group/upgrade"
                >
                    <span 
                    class="xwing-icon shrink-0"
                    :class="getSlotColor(getUpgrade(upgradeId)?.upgradeType || '')"
                    >
                    {{ getUpgradeSlotIcon(getUpgrade(upgradeId)?.upgradeType || '') }}
                    </span>
                    <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                        <span v-if="getUpgrade(upgradeId)?.isUnique" class="xwing-icon text-yellow-500 text-xs">u</span>
                        <span class="text-gray-100 truncate">{{ getUpgrade(upgradeId)?.name || upgradeId }}</span>
                    </div>
                    <div class="text-gray-400 text-xs">
                        {{ getUpgrade(upgradeId)?.upgradeType }} • 
                        <span class="text-teal-400 font-semibold">{{ getUpgrade(upgradeId)?.points || 0 }}</span> pts
                    </div>
                    </div>
                    <button
                    type="button"
                    @click="removeUpgrade(pilot.pilotId, upgradeId)"
                    class="opacity-0 group-hover/upgrade:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all shrink-0"
                    >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- Available Upgrade Slots -->
                <div v-if="card" class="flex flex-wrap gap-2">
                <div
                    v-for="(slotType, index) in getAvailableSlots(card, pilot.upgradeIds)"
                    :key="`${slotType}-${index}`"
                    class="flex-1 min-w-[150px]"
                >
                    <select
                    @change="handleUpgradeSelect(pilot.pilotId, $event)"
                    class="w-full px-2 py-1 text-xs border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-1 focus:ring-teal-500"
                    >
                    <option value="" class="text-gray-400">
                        <span class="xwing-icon" :class="getSlotColor(slotType)">{{ getUpgradeSlotIcon(slotType) }}</span>
                        {{ slotType }}
                    </option>
                    <option
                        v-for="upgrade in getUpgradesForSlot(slotType, card)"
                        :key="upgrade.id"
                        :value="upgrade.id"
                        :disabled="upgrade.isUnique && !canAddUpgrade(upgrade.id, formPilots)"
                        class="text-gray-100"
                    >
                        {{ upgrade.isUnique ? '● ' : '' }}{{ upgrade.name }} ({{ upgrade.points }})
                    </option>
                    </select>
                </div>

                <!-- Custom Upgrade Picker Button -->
                <button
                    type="button"
                    @click="openCustomPicker(pilot.pilotId)"
                    class="px-3 py-1 text-xs font-semibold bg-gray-600 text-gray-200 border border-gray-500 hover:bg-gray-500 transition-all"
                    title="Add custom upgrade (unrestricted)"
                >
                    <span class="text-sm">+</span> Custom
                </button>
                </div>
            </div>
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

    <!-- Custom Upgrade Picker Modal -->
    <Teleport to="body">
    <div
        v-if="showCustomPicker"
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        @click.self="closeCustomPicker"
    >
        <div class="bg-gray-800 border-2 border-gray-600 max-w-2xl w-full max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900">
            <h3 class="font-bold text-lg text-gray-100">Select Custom Upgrade</h3>
            <button
            type="button"
            @click="closeCustomPicker"
            class="p-2 hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
            >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>

        <!-- Search -->
        <div class="p-4 border-b border-gray-700">
            <input
            v-model="customPickerSearch"
            type="text"
            placeholder="Search upgrades..."
            class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500"
            />
        </div>

        <!-- Upgrade List -->
        <div class="flex-1 overflow-y-auto p-2">
            <div
            v-for="upgrade in filteredCustomUpgrades"
            :key="upgrade.id"
            @click="addCustomUpgrade(upgrade.id)"
            class="p-3 hover:bg-gray-700 border border-gray-700 mb-1 cursor-pointer transition-colors group"
            >
            <div class="flex items-start gap-3">
                <span 
                class="xwing-icon text-xl shrink-0"
                :class="getSlotColor(upgrade.upgradeType)"
                >
                {{ getUpgradeSlotIcon(upgrade.upgradeType) }}
                </span>
                <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span v-if="upgrade.isUnique" class="xwing-icon text-yellow-500 text-xs">u</span>
                    <span class="font-semibold text-sm text-gray-100">{{ upgrade.name }}</span>
                    <span class="text-xs text-gray-500">{{ upgrade.upgradeType }}</span>
                </div>
                <div v-if="upgrade.rulesText" class="text-xs text-gray-400 italic mb-1">
                    {{ upgrade.rulesText }}
                </div>
                <div class="text-xs text-gray-400">
                    <span class="font-bold text-teal-400">{{ upgrade.points }}</span> points
                </div>
                </div>
                <button
                class="opacity-0 group-hover:opacity-100 px-3 py-1 bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all"
                >
                ADD
                </button>
            </div>
            </div>

            <div v-if="filteredCustomUpgrades.length === 0" class="text-center py-8 text-gray-400">
            No upgrades found
            </div>
        </div>
        </div>
    </div>
    </Teleport>
</template>