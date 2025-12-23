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
  flipUpgrade: [shipId: string, upgradeId: string];
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

// Get upgrade details
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

// Get tokens grouped by type with counts
const tokenGroups = computed(() => {
  const groups = new Map<
    TokenType,
    { type: TokenType; count: number; tokens: any[] }
  >();

  props.ship.tokens.forEach((token) => {
    if (!groups.has(token.tokenType)) {
      groups.set(token.tokenType, {
        type: token.tokenType,
        count: 0,
        tokens: [],
      });
    }
    const group = groups.get(token.tokenType)!;
    group.count++;
    group.tokens.push(token);
  });

  return Array.from(groups.values());
});

// Get target lock tokens specifically
const targetLockTokens = computed(() => {
  return props.ship.tokens.filter(
    (t) => t.tokenType === TokenTypeEnum.TargetLock
  );
});

function handleToggle() {
  emit("toggleExpansion", props.ship.shipId);
}

function handleFlipUpgrade(upgradeId: string) {
  emit("flipUpgrade", props.ship.shipId, upgradeId);
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
    class="mb-2 border border-gray-700 bg-gray-800 hover:border-teal-500 transition-all relative"
  >
    <div @click="handleToggle" class="p-3 cursor-pointer">
      <div class="flex items-start gap-3">
        <!-- Ship Icon & Pilot Skill (compact) -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-2xl font-bold text-orange-500">
            {{ ship.pilotSkill }}
          </span>
          <span
            v-if="pilot"
            class="xwing-ship text-2xl"
            :class="colorClasses[playerColor]"
          >
            {{ getShipIcon(pilot.shipType) }}
          </span>
        </div>

        <!-- Pilot Name + Stats on one line (compact) -->
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-gray-100 mb-1">
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

            <!-- Upgrades List (just names) -->
            <div v-if="shipUpgrades.length > 0" class="space-y-1">
              <div
                v-for="upgrade in shipUpgrades"
                :key="upgrade.upgradeId"
                class="flex items-center gap-2 group/upgrade"
                @mouseenter="handleUpgradeHover(upgrade.upgradeId)"
                @mouseleave="handleUpgradeHover(null)"
                @click.stop="handleUpgradeClick(upgrade.upgradeId)"
              >
                <span
                  class="text-xs text-gray-400 hover:text-teal-400 cursor-pointer transition-colors"
                >
                  {{ upgrade.faceUp ? upgrade.upgrade.name : "••••••" }}
                </span>
                <button
                  v-if="upgrade.faceUp"
                  @click.stop="handleFlipUpgrade(upgrade.upgradeId)"
                  class="opacity-0 group-hover/upgrade:opacity-100 text-xs text-gray-500 hover:text-gray-300 transition-opacity"
                  title="Flip facedown"
                >
                  ⤵
                </button>
              </div>
            </div>

            <!-- Tokens Section - Show actual assigned tokens -->
            <div v-if="tokenGroups.length > 0" class="flex flex-wrap gap-2">
              <!-- Non-target-lock tokens -->
              <div
                v-for="group in tokenGroups.filter(
                  (g) => g.type !== TokenTypeEnum.TargetLock
                )"
                :key="group.type"
                class="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded group/token"
              >
                <span
                  class="xwing-icon text-lg"
                  :class="getTokenColor(group.type)"
                >
                  {{ getTokenIcon(group.type) }}
                </span>
                <span class="text-xs text-gray-300 font-medium">{{
                  group.count
                }}</span>
                <button
                  @click.stop="handleSpendToken(group.type)"
                  class="opacity-0 group-hover/token:opacity-100 text-xs px-1 bg-red-600 hover:bg-red-700 rounded transition-opacity"
                  title="Spend token"
                >
                  ×
                </button>
              </div>

              <!-- Target locks (show each one with target) -->
              <div
                v-for="(token, index) in targetLockTokens"
                :key="`tl-${index}`"
                class="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded group/token"
              >
                <span class="xwing-icon text-lg text-red-500">
                  {{ getTokenIcon(TokenTypeEnum.TargetLock) }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ getLockedShipName(token.targetShipId) }}
                </span>
                <button
                  @click.stop="handleSpendToken(TokenTypeEnum.TargetLock)"
                  class="opacity-0 group-hover/token:opacity-100 text-xs px-1 bg-red-600 hover:bg-red-700 rounded transition-opacity"
                  title="Spend target lock"
                >
                  ×
                </button>
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

        <!-- Collapse/Expand Toggle -->
        <button
          @click.stop="isCardCollapsed = !isCardCollapsed"
          class="shrink-0 p-1 hover:bg-gray-700 rounded transition-colors"
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

        <!-- Expand Arrow for Token Manager -->
        <svg
          class="w-5 h-5 text-gray-400 shrink-0 transition-transform"
          :class="isExpanded ? 'rotate-90' : ''"
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
