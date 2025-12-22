<script setup lang="ts">
import type { ShipStateDto, WeaponStateDto } from "#shared/game-state-dto";
import type { PilotDto } from "#shared/cards";
import {
  getShipIcon,
  STAT_ICONS,
  UPGRADE_SLOT_ICONS,
} from "#shared/xwing-icons";

interface ShipWithPilot {
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
}

const props = defineProps<{
  attackingShip: ShipWithPilot;
  defendingShip: ShipWithPilot;
  playerColor: "red" | "gray";
}>();

const emit = defineEmits<{
  selectWeapon: [weaponId: string, baseAttackDice: number];
  skipAttack: [];
}>();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};

const availableWeapons = computed(() => {
  return props.attackingShip.ship.weapons.filter(
    (weapon) => !weapon.isDestroyed && (weapon.ammo === null || weapon.ammo > 0)
  );
});

function getWeaponIcon(weaponType: string): string {
  return UPGRADE_SLOT_ICONS[weaponType] || "?";
}

function formatRange(minRange: number | null, maxRange: number | null): string {
  if (minRange === null || maxRange === null) return "—";
  if (minRange === maxRange) return `${minRange}`;
  return `${minRange}-${maxRange}`;
}

function formatAmmo(ammo: number | null): string {
  if (ammo === null) return "∞";
  return `${ammo}`;
}

function handleSelectWeapon(weapon: WeaponStateDto) {
  if (weapon.attack === null) return;
  emit("selectWeapon", weapon.weaponId, weapon.attack);
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 bg-gray-800">
      <h2 class="text-2xl font-bold text-gray-100 mb-4">Select Weapon</h2>

      <!-- Attacker and Defender Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Attacker -->
        <div class="flex items-center gap-4">
          <div
            class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-orange-600 text-white"
          >
            {{ attackingShip.ship.pilotSkill }}
          </div>
          <span
            v-if="attackingShip.pilot"
            class="xwing-ship text-4xl shrink-0"
            :class="colorClasses[playerColor]"
          >
            {{ getShipIcon(attackingShip.pilot.shipType) }}
          </span>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold text-gray-100">
              {{ attackingShip.pilot?.pilotName || "Unknown" }}
            </h3>
            <p class="text-xs text-gray-400">Attacker</p>
          </div>
        </div>

        <!-- Defender -->
        <div class="flex items-center gap-4">
          <div
            class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-orange-600 text-white"
          >
            {{ defendingShip.ship.pilotSkill }}
          </div>
          <span
            v-if="defendingShip.pilot"
            class="xwing-ship text-4xl shrink-0 text-gray-400"
          >
            {{ getShipIcon(defendingShip.pilot.shipType) }}
          </span>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold text-gray-100">
              {{ defendingShip.pilot?.pilotName || "Unknown" }}
            </h3>
            <p class="text-xs text-gray-400">Defender</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Weapon Selection -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="availableWeapons.length === 0" class="text-center py-12">
        <p class="text-xl text-gray-400 mb-2">No weapons available</p>
        <p class="text-sm text-gray-500">
          All weapons are destroyed or out of ammo
        </p>
      </div>

      <div v-else class="max-w-4xl mx-auto space-y-3">
        <button
          v-for="weapon in availableWeapons"
          :key="weapon.weaponId"
          @click="handleSelectWeapon(weapon)"
          class="w-full p-4 border-2 border-teal-600 bg-teal-900/20 hover:bg-teal-900/40 hover:border-teal-500 transition-all text-left"
        >
          <div class="flex items-center gap-4">
            <!-- Weapon Icon -->
            <div
              class="shrink-0 w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-teal-600"
            >
              <span class="xwing-icon text-2xl text-teal-400">
                {{ getWeaponIcon(weapon.type) }}
              </span>
            </div>

            <!-- Weapon Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-lg font-semibold text-gray-100">
                  {{ weapon.name }}
                </h3>
                <span class="text-xs text-gray-400 uppercase tracking-wide">
                  {{ weapon.type }}
                </span>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-300">
                <span class="flex items-center gap-1">
                  <span class="xwing-icon text-red-500">{{
                    STAT_ICONS.attack
                  }}</span>
                  <span class="font-medium">
                    {{ weapon.attack !== null ? weapon.attack : "—" }}
                  </span>
                </span>
                <span class="text-gray-500"
                  >Range:
                  {{ formatRange(weapon.minRange, weapon.maxRange) }}</span
                >
                <span v-if="weapon.ammo !== null" class="text-gray-500">
                  Ammo: {{ formatAmmo(weapon.ammo) }}
                </span>
              </div>
            </div>

            <!-- Attack Value Badge -->
            <div
              v-if="weapon.attack !== null"
              class="shrink-0 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-red-800"
            >
              {{ weapon.attack }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
