<script setup lang="ts">
import type { SquadUpdateDto, SquadUpdateResponseDto } from "#shared/squad-dto";
import type { UpgradeDto, PilotDto as CardPilotDto } from "#shared/cards";
import { Faction, factionOptions } from "#shared/enums";
import {
  STAT_ICONS,
  getShipIcon,
  getUpgradeSlotIcon,
} from "#shared/xwing-icons";

const { selectedSquad, formPilots, removePilot, refreshList, pointLimit } =
  useSquadEditor();
const { cards } = useCards();
const { getUpgradesForSlot, getUpgrade, canAddUpgrade, getAllUpgrades } =
  useUpgrades();

const form = ref<{ name: string; faction: Faction }>({
  name: "",
  faction: Faction.Rebel,
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

// Custom upgrade picker state
const showCustomPicker = ref(false);
const customPickerPilotId = ref<string | null>(null);
const customPickerSearch = ref("");

// Hover state for upgrade card images
const hoveredUpgrade = ref<UpgradeDto | null>(null);
const hoverPosition = ref({ x: 0, y: 0 });

// Track which upgrade slot menu is open (pilotId-slotIndex)
const openSlotMenu = ref<string | null>(null);

const isEditing = computed(() => !!selectedSquad.value);

const pilotDetails = computed(() => {
  if (!cards.value) return [];
  return formPilots.value.map((pilot) => {
    const card = cards.value!.pilots.find((p) => p.id === pilot.pilotId);
    return {
      pilot,
      card,
    };
  });
});

// Calculate total points live
const squadPoints = computed(() => {
  if (!cards.value) return { total: 0, isOverLimit: false };

  let total = 0;

  formPilots.value.forEach((pilot) => {
    const card = cards.value!.pilots.find((p) => p.id === pilot.pilotId);
    if (card) {
      total += card.points;

      // Add upgrade points
      pilot.upgradeIds?.forEach((upgradeId) => {
        const upgrade = cards.value!.upgrades.find((u) => u.id === upgradeId);
        if (upgrade) {
          total += upgrade.points;
        }
      });
    }
  });

  return {
    total,
    isOverLimit: total > pointLimit.value,
  };
});

// Filtered upgrades for custom picker
const filteredCustomUpgrades = computed(() => {
  const all = getAllUpgrades();
  if (!customPickerSearch.value.trim()) return all;

  const search = customPickerSearch.value.toLowerCase();
  return all.filter(
    (u) =>
      u.name.toLowerCase().includes(search) ||
      u.upgradeType.toLowerCase().includes(search)
  );
});

watch(
  selectedSquad,
  (squad) => {
    if (squad) {
      form.value = {
        name: squad.name,
        faction: squad.faction,
      };
      error.value = null;
      success.value = false;
    }
  },
  { immediate: true }
);

async function saveSquad() {
  error.value = null;
  success.value = false;
  loading.value = true;

  try {
    const body: SquadUpdateDto = {
      name: form.value.name,
      faction: form.value.faction,
      ships: formPilots.value,
    };

    await $fetch(`/api/squads/${selectedSquad.value!.id}`, {
      method: "PUT",
      body,
    });

    success.value = true;

    await refreshList();
  } catch (e) {
    error.value = (e as any).data?.message || "Failed to save squad";
  } finally {
    loading.value = false;
  }
}

function handleRemovePilot(pilotId: string) {
  removePilot(pilotId);
}

// Get all upgrade slots for a pilot (base slots + their current assignments)
function getAllUpgradeSlots(pilotCard: CardPilotDto, pilot: any) {
  interface SlotInfo {
    slotIndex: number;
    slotType: string;
    upgradeId: string | null;
  }

  const baseSlots = [...pilotCard.upgradeSlots];
  const upgradeIds = pilot.upgradeIds || [];
  const slots: SlotInfo[] = [];
  const assignedUpgrades = new Set<string>();

  // Iterate through base slots in their original order
  baseSlots.forEach((slotType, index) => {
    // Find an unassigned upgrade that fits this slot
    const matchingUpgrade = upgradeIds.find((upgradeId: string) => {
      if (assignedUpgrades.has(upgradeId)) return false;
      const upgrade = getUpgrade(upgradeId);
      if (!upgrade) return false;
      // Check if this upgrade can use this slot type
      return upgrade.slotsRequired.includes(slotType);
    });

    slots.push({
      slotIndex: index,
      slotType,
      upgradeId: matchingUpgrade || null,
    });

    if (matchingUpgrade) {
      assignedUpgrades.add(matchingUpgrade);
    }
  });

  // Add unassigned upgrades (custom upgrades that don't match any base slot)
  const unassignedUpgrades = upgradeIds.filter((upgradeId: string) => !assignedUpgrades.has(upgradeId));
  unassignedUpgrades.forEach((upgradeId: string, index: number) => {
    const upgrade = getUpgrade(upgradeId);
    if (upgrade) {
      // Use the first slot type from the upgrade, or "Custom" if none
      const slotType = upgrade.slotsRequired[0] || upgrade.upgradeType || "Custom";
      slots.push({
        slotIndex: baseSlots.length + index,
        slotType,
        upgradeId,
      });
    }
  });

  return slots;
}

function selectUpgradeForSlot(
  pilotId: string,
  slotIndex: number,
  upgradeId: string
) {
  const pilot = formPilots.value.find((p) => p.pilotId === pilotId);
  if (!pilot) return;

  // Get the slot info
  const pilotCard = cards.value?.pilots.find((p) => p.id === pilotId);
  if (!pilotCard) return;

  const slots = getAllUpgradeSlots(pilotCard, pilot);
  const slot = slots[slotIndex];
  if (!slot) return;

  // If there's already an upgrade in this slot, replace it
  if (slot.upgradeId) {
    const existingIndex = pilot.upgradeIds.indexOf(slot.upgradeId);
    if (existingIndex !== -1) {
      pilot.upgradeIds[existingIndex] = upgradeId;
    }
  } else {
    // Add new upgrade
    pilot.upgradeIds.push(upgradeId);
  }

  closeSlotMenu();
}

function removeUpgradeFromSlot(pilotId: string, slotIndex: number) {
  const pilot = formPilots.value.find((p) => p.pilotId === pilotId);
  if (!pilot) return;

  const pilotCard = cards.value?.pilots.find((p) => p.id === pilotId);
  if (!pilotCard) return;

  const slots = getAllUpgradeSlots(pilotCard, pilot);
  const slot = slots[slotIndex];
  if (slot && slot.upgradeId) {
    pilot.upgradeIds = pilot.upgradeIds.filter((id) => id !== slot.upgradeId);
  }
}

function openCustomPicker(pilotId: string) {
  customPickerPilotId.value = pilotId;
  showCustomPicker.value = true;
  customPickerSearch.value = "";
}

function closeCustomPicker() {
  showCustomPicker.value = false;
  customPickerPilotId.value = null;
  customPickerSearch.value = "";
}

function addCustomUpgrade(upgradeId: string) {
  if (!customPickerPilotId.value) return;
  
  const pilot = formPilots.value.find(
    (p) => p.pilotId === customPickerPilotId.value
  );
  
  if (!pilot) return;
  
  if (!pilot.upgradeIds) {
    pilot.upgradeIds = [];
  }
  
  pilot.upgradeIds.push(upgradeId);
  closeCustomPicker();
}

function getSlotColor(slotType: string): string {
  const colors: Record<string, string> = {
    Elite: "text-yellow-500",
    Talent: "text-yellow-500",
    Astromech: "text-blue-400",
    Torpedo: "text-red-500",
    Missile: "text-orange-500",
    Cannon: "text-red-400",
    Turret: "text-purple-500",
    Bomb: "text-gray-400",
    Device: "text-gray-400",
    Crew: "text-green-500",
    Modification: "text-teal-500",
    Tech: "text-cyan-500",
    Illicit: "text-pink-500",
    Title: "text-amber-500",
    System: "text-indigo-500",
    Sensor: "text-indigo-400",
  };
  return colors[slotType] || "text-gray-400";
}

function handleUpgradeHover(upgrade: UpgradeDto | null, event: MouseEvent) {
  hoveredUpgrade.value = upgrade;
  if (upgrade && upgrade.cardImageUrl) {
    hoverPosition.value = {
      x: event.clientX,
      y: event.clientY,
    };
  }
}

function handleUpgradeLeave() {
  hoveredUpgrade.value = null;
}

function toggleSlotMenu(slotKey: string) {
  openSlotMenu.value = openSlotMenu.value === slotKey ? null : slotKey;
}

function closeSlotMenu() {
  openSlotMenu.value = null;
}

onMounted(() => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".upgrade-slot-menu")) {
      closeSlotMenu();
    }
  });
});
</script>
<template>
  <div class="h-full flex flex-col bg-gray-900">
    <div class="p-4 border-b border-gray-700 bg-gray-800">
      <div class="flex items-baseline justify-between">
        <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">
          {{ isEditing ? "Squad Editor" : "No Squad Selected" }}
        </h2>
        <div v-if="isEditing" class="flex items-baseline gap-2">
          <span class="text-2xl font-bold" :class="squadPoints.isOverLimit ? 'text-red-400' : 'text-teal-400'">
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
        <p class="text-xs text-gray-500">
          Select a squad from the list or create a new one
        </p>
      </div>
    </div>

    <form v-else @submit.prevent="saveSquad" class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        <div>
          <label for="name" class="block text-xs font-medium mb-1.5 uppercase tracking-wide text-gray-400">
            Squad Name
          </label>
          <input id="name" v-model="form.name" type="text" required
            class="w-full px-3 py-2 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-800 text-gray-100"
            placeholder="Enter squad name" />
        </div>

        <!-- Pilots Section -->
        <div>
          <label class="block text-xs font-medium mb-2 uppercase tracking-wide text-gray-400">
            Pilots ({{ formPilots.length }})
          </label>
          <div v-if="formPilots.length === 0"
            class="text-sm text-gray-500 italic p-6 border-2 border-dashed border-gray-700 bg-gray-800 text-center">
            No pilots added yet. Select a ship and click "ADD" on a pilot.
          </div>
          <div v-else class="space-y-3">
            <div v-for="{ pilot, card } in pilotDetails" :key="pilot.pilotId"
              class="border border-gray-700 bg-gray-800 hover:bg-gray-750 group">
              <!-- Pilot Header -->
              <div class="flex items-start gap-3 p-3 border-b border-gray-700">
                <span class="xwing-ship text-3xl text-gray-300 shrink-0">
                  {{ getShipIcon(card?.shipType || "") }}
                </span>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span v-if="card?.isUnique" class="xwing-icon text-yellow-500 text-xs">u</span>
                    <span class="font-semibold text-sm text-gray-100">{{
                      card?.pilotName || pilot.pilotId
                    }}</span>
                    <span class="text-xs text-gray-500">PS {{ card?.pilotSkill || "?" }}</span>
                  </div>

                  <div class="flex gap-3 text-xs mb-1">
                    <span class="flex items-center gap-0.5 text-gray-300">
                      <span class="xwing-icon text-red-500 text-sm">{{
                        STAT_ICONS.attack
                      }}</span>
                      <span class="font-medium">{{ card?.attack }}</span>
                    </span>
                    <span class="flex items-center gap-0.5 text-gray-300">
                      <span class="xwing-icon text-green-500 text-sm">{{
                        STAT_ICONS.agility
                      }}</span>
                      <span class="font-medium">{{ card?.agility }}</span>
                    </span>
                    <span class="flex items-center gap-0.5 text-gray-300">
                      <span class="xwing-icon text-gray-400 text-sm">{{
                        STAT_ICONS.hull
                      }}</span>
                      <span class="font-medium">{{ card?.hull }}</span>
                    </span>
                    <span class="flex items-center gap-0.5 text-gray-300">
                      <span class="xwing-icon text-blue-500 text-sm">{{
                        STAT_ICONS.shield
                      }}</span>
                      <span class="font-medium">{{ card?.shields }}</span>
                    </span>
                  </div>

                  <div class="text-xs text-gray-400">
                    <span class="font-bold text-teal-400">{{
                      card?.points || 0
                    }}</span>
                    points
                  </div>

                  <div v-if="card?.ability" class="text-xs text-gray-400 italic leading-relaxed mt-2">
                    {{ card.ability }}
                  </div>
                </div>

                <button type="button" @click="handleRemovePilot(pilot.pilotId)"
                  class="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-900 transition-all shrink-0">
                  REMOVE
                </button>
              </div>

              <!-- Upgrades Section -->
              <div class="p-3 space-y-2">
                <!-- All Upgrade Slots (both filled and empty) -->
                <div v-if="card" class="space-y-2">
                  <div v-for="(slot, index) in getAllUpgradeSlots(card, pilot)" :key="`${slot.slotType}-${index}`"
                    class="relative flex items-center gap-2 upgrade-slot-menu">
                    <!-- Slot Type Icon -->
                    <span class="xwing-icon text-lg shrink-0" :class="getSlotColor(slot.slotType)"
                      :title="slot.slotType">
                      {{ getUpgradeSlotIcon(slot.slotType) }}
                    </span>

                    <!-- Upgrade Dropdown Button -->
                    <button type="button" @click.stop="toggleSlotMenu(`${pilot.pilotId}-${index}`)"
                      class="flex-1 px-2 py-1 text-xs border transition-colors flex items-center justify-between"
                      :class="slot.upgradeId
                        ? 'border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600'
                        : 'border-gray-600 bg-gray-750 text-gray-400 hover:bg-gray-700'
                        " @mouseenter="
                          slot.upgradeId
                            ? handleUpgradeHover(
                              getUpgrade(slot.upgradeId) || null,
                              $event
                            )
                            : null
                          " @mousemove="
                          slot.upgradeId
                            ? handleUpgradeHover(
                              getUpgrade(slot.upgradeId) || null,
                              $event
                            )
                            : null
                          " @mouseleave="handleUpgradeLeave">
                      <span class="flex items-center gap-1 flex-1 min-w-0">
                        <span v-if="
                          slot.upgradeId &&
                          getUpgrade(slot.upgradeId)?.isUnique
                        " class="xwing-icon text-yellow-500 text-xs shrink-0">u</span>
                        <span class="truncate">
                          {{
                            slot.upgradeId
                              ? getUpgrade(slot.upgradeId)?.name
                              : `Select ${slot.slotType}`
                          }}
                        </span>
                        <span v-if="slot.upgradeId" class="text-teal-400 shrink-0">
                          ({{ getUpgrade(slot.upgradeId)?.points }})
                        </span>
                      </span>
                      <svg class="w-3 h-3 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <!-- Clear Button (only show if slot is filled) -->
                    <button v-if="slot.upgradeId" type="button" @click.stop="
                      removeUpgradeFromSlot(pilot.pilotId, slot.slotIndex)
                      " class="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-all shrink-0"
                      title="Clear slot">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="openSlotMenu === `${pilot.pilotId}-${index}`"
                      class="absolute left-0 right-0 top-full mt-1 z-50 w-64 max-h-96 overflow-y-auto bg-gray-800 border border-gray-700 shadow-xl">
                      <!-- Clear option if slot is filled -->
                      <div v-if="slot.upgradeId" @click.stop="
                        removeUpgradeFromSlot(pilot.pilotId, slot.slotIndex);
                      closeSlotMenu();
                      "
                        class="px-3 py-2 hover:bg-red-900/30 cursor-pointer border-b border-gray-700 text-red-400 font-semibold">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span class="text-xs">Clear Slot</span>
                        </div>
                      </div>

                      <!-- Available upgrades -->
                      <div v-for="upgrade in getUpgradesForSlot(
                        slot.slotType,
                        card
                      )" :key="upgrade.id" @click.stop="
                        !upgrade.isUnique ||
                          canAddUpgrade(upgrade.id, formPilots, pilot.pilotId)
                          ? selectUpgradeForSlot(
                            pilot.pilotId,
                            slot.slotIndex,
                            upgrade.id
                          )
                          : null
                        " @mouseenter="handleUpgradeHover(upgrade, $event)"
                        @mousemove="handleUpgradeHover(upgrade, $event)" @mouseleave="handleUpgradeLeave"
                        class="px-3 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors"
                        :class="{
                          'opacity-50 cursor-not-allowed':
                            upgrade.isUnique &&
                            !canAddUpgrade(
                              upgrade.id,
                              formPilots,
                              pilot.pilotId
                            ),
                          'bg-gray-700': slot.upgradeId === upgrade.id,
                        }">
                        <div class="flex items-start gap-2">
                          <span class="xwing-icon text-sm shrink-0 mt-0.5" :class="getSlotColor(upgrade.upgradeType)">
                            {{ getUpgradeSlotIcon(upgrade.upgradeType) }}
                          </span>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1">
                              <span v-if="upgrade.isUnique" class="xwing-icon text-yellow-500 text-xs">u</span>
                              <span class="text-xs text-gray-100 truncate">{{
                                upgrade.name
                              }}</span>
                            </div>
                            <div class="text-xs text-teal-400 font-semibold">
                              {{ upgrade.points }} pts
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="
                        getUpgradesForSlot(slot.slotType, card).length === 0
                      " class="px-3 py-4 text-center text-xs text-gray-500">
                        No upgrades available
                      </div>
                    </div>
                  </div>

                  <!-- Custom Upgrade Picker Button -->
                  <button type="button" @click="openCustomPicker(pilot.pilotId)"
                    class="w-full px-3 py-1 text-xs font-semibold bg-gray-600 text-gray-200 border border-gray-500 hover:bg-gray-500 transition-all"
                    title="Add custom upgrade (unrestricted)">
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
          <button type="submit" :disabled="loading || !form.name"
            class="px-6 py-2 text-sm font-bold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide">
            {{ loading ? "Saving..." : "Save Squad" }}
          </button>
        </div>
      </div>
    </form>
  </div>

  <!-- Custom Upgrade Picker Modal -->
  <Teleport to="body">
    <div v-if="showCustomPicker" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      @click.self="closeCustomPicker">
      <div class="bg-gray-800 border-2 border-gray-600 max-w-2xl w-full max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900">
          <h3 class="font-bold text-lg text-gray-100">Select Custom Upgrade</h3>
          <button type="button" @click="closeCustomPicker"
            class="p-2 hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="p-4 border-b border-gray-700">
          <input v-model="customPickerSearch" type="text" placeholder="Search upgrades..."
            class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500" />
        </div>

        <!-- Upgrade List -->
        <div class="flex-1 overflow-y-auto p-2">
          <div v-for="upgrade in filteredCustomUpgrades" :key="upgrade.id" @click="addCustomUpgrade(upgrade.id)"
            @mouseenter="handleUpgradeHover(upgrade, $event)" @mousemove="handleUpgradeHover(upgrade, $event)"
            @mouseleave="handleUpgradeLeave"
            class="p-3 hover:bg-gray-700 border border-gray-700 mb-1 cursor-pointer transition-colors group">
            <div class="flex items-start gap-3">
              <span class="xwing-icon text-xl shrink-0" :class="getSlotColor(upgrade.upgradeType)">
                {{ getUpgradeSlotIcon(upgrade.upgradeType) }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span v-if="upgrade.isUnique" class="xwing-icon text-yellow-500 text-xs">u</span>
                  <span class="font-semibold text-sm text-gray-100">{{
                    upgrade.name
                  }}</span>
                  <span class="text-xs text-gray-500">{{
                    upgrade.upgradeType
                  }}</span>
                </div>
                <div v-if="upgrade.rulesText" class="text-xs text-gray-400 italic mb-1">
                  {{ upgrade.rulesText }}
                </div>
                <div class="text-xs text-gray-400">
                  <span class="font-bold text-teal-400">{{
                    upgrade.points
                  }}</span>
                  points
                </div>
              </div>
              <button
                class="opacity-0 group-hover:opacity-100 px-3 py-1 bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all">
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

  <!-- Upgrade Card Image Tooltip -->
  <Teleport to="body">
    <div v-if="hoveredUpgrade && hoveredUpgrade.cardImageUrl" class="fixed z-60 pointer-events-none" :style="{
      left: `${Math.max(20, hoverPosition.x - 400)}px`,
      top: `${Math.max(20, hoverPosition.y - 150)}px`,
    }">
      <img :src="hoveredUpgrade.cardImageUrl" :alt="hoveredUpgrade.name"
        class="w-64 rounded-lg shadow-2xl border-2 border-gray-300" />
    </div>
  </Teleport>
</template>
