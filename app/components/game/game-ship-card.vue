<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto, UpgradeDto } from "#shared/cards";
import type { TokenType } from "#shared/enums";
import { TokenType as TokenTypeEnum } from "#shared/enums";
import {
  getShipIcon,
  STAT_ICONS,
  getActionIcon,
  getTokenIcon,
} from "#shared/xwing-icons";
import { ATTACK_DIE_ICONS } from "#shared/dice";

interface ShipWithPilot {
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
}

const props = defineProps<{
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
  isExpanded: boolean;
  playerColor: "red" | "gray";
  allShips: ShipWithPilot[];
}>();

const emit = defineEmits<{
  toggleExpansion: [shipId: string];
  flipUpgrade: [shipId: string, upgradeId: string, faceUp: boolean];
  spendToken: [shipId: string, tokenType: TokenType];
}>();

const { cards } = useCards();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};

const isCardCollapsed = ref(false);
const hoveredUpgradeId = ref<string | null>(null);
const clickedUpgradeId = ref<string | null>(null);

const assignedCrits = computed(() => {
  if (!cards.value) return [];
  return props.ship.faceUpDamage
    .map((crit) => {
      const card = cards.value!.damageCards.find(
        (c) => c.id === crit.critCardId
      );
      return card ? { ...crit, card } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);
});

const shipUpgrades = computed(() => {
  if (!cards.value) return [];
  return props.ship.upgrades
    .map((u) => {
      const upgrade = cards.value!.upgrades.find((up) => up.id === u.upgradeId);
      return upgrade ? { ...u, upgrade } : null;
    })
    .filter(
      (u): u is { upgradeId: string; faceUp: boolean; upgrade: UpgradeDto } =>
        u !== null
    );
});

function handleCardClick() {
  emit("toggleExpansion", props.ship.shipId);
}

function handleFlipUpgrade(upgradeId: string, currentFaceUp: boolean) {
  emit("flipUpgrade", props.ship.shipId, upgradeId, !currentFaceUp);
}

function handleSpendToken(tokenType: TokenType) {
  emit("spendToken", props.ship.shipId, tokenType);
}

function handleUpgradeHover(upgradeId: string | null) {
  hoveredUpgradeId.value = upgradeId;
}

function handleUpgradeClick(upgradeId: string) {
  if (clickedUpgradeId.value === upgradeId) {
    clickedUpgradeId.value = null;
  } else {
    clickedUpgradeId.value = upgradeId;
  }
}

const activeUpgradeId = computed(() => {
  return clickedUpgradeId.value || hoveredUpgradeId.value;
});

const activeUpgrade = computed(() => {
  if (!activeUpgradeId.value) return null;
  return shipUpgrades.value.find((u) => u.upgradeId === activeUpgradeId.value);
});

function getLockedShipName(targetShipId: string | null): string {
  if (!targetShipId) return "?";
  const targetShip = props.allShips.find((s) => s.ship.shipId === targetShipId);
  return targetShip?.pilot?.pilotName || "Target";
}

function getTokenColor(tokenType: TokenType): string {
  const tokenColors: Record<TokenType, string> = {
    [TokenTypeEnum.Focus]: "text-green-500",
    [TokenTypeEnum.Evade]: "text-blue-400",
    [TokenTypeEnum.Stress]: "text-red-500",
    [TokenTypeEnum.TargetLock]: "text-red-500",
    [TokenTypeEnum.Ion]: "text-cyan-400",
    [TokenTypeEnum.WeaponsDisabled]: "text-orange-500",
    [TokenTypeEnum.Cloak]: "text-purple-400",
    [TokenTypeEnum.Tractor]: "text-teal-400",
    [TokenTypeEnum.Shield]: "text-blue-500",
    [TokenTypeEnum.Condition]: "text-orange-500",
    [TokenTypeEnum.Reinforce]: "text-yellow-500",
    [TokenTypeEnum.Jam]: "text-red-400",
  };
  return tokenColors[tokenType] || "text-gray-300";
}
</script>

<template>
  <div
    class="mb-2 border border-gray-700 bg-gray-800 hover:border-teal-500 transition-all relative cursor-pointer"
    @click="handleCardClick"
  >
    <div class="p-3 relative">
      <!-- Collapse/Expand Toggle - Top Right -->
      <button
        @click.stop="isCardCollapsed = !isCardCollapsed"
        class="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded transition-colors z-10"
        title="Collapse/expand card"
      >
        <svg
          class="w-4 h-4 text-gray-400 transition-transform"
          :class="isCardCollapsed ? 'rotate-180' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>

      <div class="flex items-start gap-3 pr-8">
        <!-- Pilot Skill + Ship Icon + Name on one line -->
        <div class="flex items-center gap-2 shrink-0">
          <span
            class="text-xl font-bold"
            :class="isExpanded ? 'text-orange-500' : 'text-gray-400'"
          >
            {{ ship.pilotSkill }}
          </span>
          <span
            v-if="pilot"
            class="xwing-ship text-xl"
            :class="colorClasses[playerColor]"
          >
            {{ getShipIcon(pilot.shipType) }}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <!-- Pilot Name on same line -->
          <div class="text-sm font-semibold text-gray-100 mb-2">
            {{ pilot?.pilotName || "Unknown" }}
          </div>

          <div v-if="!isCardCollapsed" class="space-y-2">
            <!-- Stats Row -->
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-red-500">{{
                  STAT_ICONS.attack
                }}</span>
                <span class="font-medium">{{ ship.attack }}</span>
              </span>
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-green-500">{{
                  STAT_ICONS.agility
                }}</span>
                <span class="font-medium">{{ ship.agility }}</span>
              </span>
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-yellow-500">{{
                  STAT_ICONS.hull
                }}</span>
                <span class="font-medium">{{ ship.hull }}</span>
              </span>
              <span class="flex items-center gap-1 text-gray-300">
                <span class="xwing-icon text-blue-500">{{
                  STAT_ICONS.shield
                }}</span>
                <span class="font-medium">{{ ship.shields }}</span>
              </span>
            </div>

            <!-- Upgrades List -->
            <div v-if="shipUpgrades.length > 0" class="space-y-1">
              <div
                v-for="upgrade in shipUpgrades"
                :key="upgrade.upgradeId"
                class="flex items-center gap-2 group/upgrade"
                @mouseenter="handleUpgradeHover(upgrade.upgradeId)"
                @mouseleave="handleUpgradeHover(null)"
              >
                <span
                  class="text-xs text-gray-400 hover:text-teal-400 cursor-pointer transition-colors"
                  :class="{ 'line-through': !upgrade.faceUp }"
                  @click.stop="handleUpgradeClick(upgrade.upgradeId)"
                >
                  {{ upgrade.upgrade.name }}
                </span>
                <button
                  @click.stop="
                    handleFlipUpgrade(upgrade.upgradeId, upgrade.faceUp)
                  "
                  class="text-xs text-gray-500 hover:text-gray-300 transition-opacity"
                  :title="upgrade.faceUp ? 'Flip facedown' : 'Flip faceup'"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Tokens Section - Show each token individually -->
            <div v-if="ship.tokens.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="(token, index) in ship.tokens"
                :key="`token-${index}`"
                class="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded group/token"
              >
                <span
                  class="xwing-icon text-lg"
                  :class="getTokenColor(token.tokenType)"
                >
                  {{ getTokenIcon(token.tokenType) }}
                </span>
                <span
                  v-if="token.tokenType === TokenTypeEnum.TargetLock"
                  class="text-xs text-gray-400"
                >
                  {{ getLockedShipName(token.targetShipId) }}
                </span>
                <button
                  @click.stop="handleSpendToken(token.tokenType)"
                  class="opacity-0 group-hover/token:opacity-100 text-xs px-1 bg-red-600 hover:bg-red-700 rounded transition-opacity"
                  title="Spend token"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Crits Section -->
            <div v-if="assignedCrits.length > 0" class="space-y-1">
              <div
                v-for="(crit, index) in assignedCrits"
                :key="`crit-${index}`"
                class="text-xs bg-gray-900 px-2 py-1 rounded"
                :class="
                  crit.faceUp
                    ? 'border-l-2 border-orange-500'
                    : 'border-l-2 border-gray-600'
                "
              >
                <div class="flex items-center gap-1">
                  <span class="xwing-icon text-orange-500">{{
                    ATTACK_DIE_ICONS.crit
                  }}</span>
                  <span class="font-semibold text-gray-200">{{
                    crit.card.name
                  }}</span>
                  <span v-if="!crit.faceUp" class="text-gray-500 italic"
                    >(facedown)</span
                  >
                </div>
                <div
                  v-if="crit.faceUp && crit.card.text"
                  class="text-gray-400 mt-1 leading-relaxed"
                >
                  {{ crit.card.text }}
                </div>
              </div>
            </div>

            <!-- Action Bar -->
            <div
              v-if="pilot?.actions && pilot.actions.length > 0"
              class="flex items-center gap-1"
            >
              <span
                v-for="action in pilot.actions"
                :key="action"
                class="xwing-icon text-sm text-gray-400"
                :title="action"
              >
                {{ getActionIcon(action) }}
              </span>
            </div>

            <!-- Pilot Ability -->
            <div
              v-if="pilot?.ability"
              class="text-xs text-gray-400 italic leading-relaxed"
            >
              {{ pilot.ability }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Card Popup (hover/click) -->
    <div
      v-if="activeUpgrade"
      class="absolute left-full ml-2 top-0 z-50 w-80 bg-gray-900 border border-teal-500 shadow-xl p-4 pointer-events-none"
    >
      <div class="text-sm font-bold text-teal-400 mb-2">
        {{ activeUpgrade.upgrade.name }}
      </div>
      <div class="text-xs text-gray-400 mb-2">
        {{ activeUpgrade.upgrade.upgradeType }}
        <span v-if="activeUpgrade.upgrade.isUnique" class="text-orange-500"
          >•</span
        >
      </div>
      <div
        v-if="activeUpgrade.upgrade.rulesText"
        class="text-xs text-gray-300 leading-relaxed"
      >
        {{ activeUpgrade.upgrade.rulesText }}
      </div>
      <div
        v-if="activeUpgrade.upgrade.attack"
        class="text-xs text-gray-400 mt-2"
      >
        Attack: {{ activeUpgrade.upgrade.attack }} | Range:
        {{ activeUpgrade.upgrade.minRange }}-{{
          activeUpgrade.upgrade.maxRange
        }}
      </div>
      <div class="text-xs text-teal-400 mt-2 font-bold">
        {{ activeUpgrade.upgrade.points }} points
      </div>
    </div>
  </div>
</template>
