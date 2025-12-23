<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto, UpgradeDto } from "#shared/cards";
import type { TokenType } from "#shared/enums";
import { getShipIcon, STAT_ICONS, getActionIcon, TOKEN_ICONS } from "#shared/xwing-icons";

interface ShipWithPilot {
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
}

const props = defineProps<{
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
  isExpanded: boolean;
  playerColor: "red" | "gray";
  allShips?: ShipWithPilot[];
}>();

const emit = defineEmits<{
  toggleExpansion: [shipId: string];
  removeToken: [shipId: string, tokenType: TokenType];
  flipUpgrade: [shipId: string, upgradeId: string, faceUp: boolean];
}>();

const { cards } = useCards();

const colorClasses = {
  red: "text-red-400",
  gray: "text-gray-400",
};

const hoveredUpgrade = ref<UpgradeDto | null>(null);
const clickedUpgrade = ref<UpgradeDto | null>(null);
const hoverPosition = ref({ x: 0, y: 0 });
const isCollapsed = ref(false);

function handleToggle() {
  emit("toggleExpansion", props.ship.shipId);
}

function handleCollapse(e: MouseEvent) {
  e.stopPropagation();
  isCollapsed.value = !isCollapsed.value;
}

function getUpgrade(upgradeId: string): UpgradeDto | undefined {
  return cards.value?.upgrades.find((u) => u.id === upgradeId);
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

function handleUpgradeClick(upgrade: UpgradeDto, event: MouseEvent) {
  event.stopPropagation();
  clickedUpgrade.value = clickedUpgrade.value === upgrade ? null : upgrade;
}

function handleFlipUpgrade(upgradeId: string, currentFaceUp: boolean, event: MouseEvent) {
  event.stopPropagation();
  emit("flipUpgrade", props.ship.shipId, upgradeId, !currentFaceUp);
}

function handleRemoveToken(tokenType: TokenType, event: MouseEvent) {
  event.stopPropagation();
  emit("removeToken", props.ship.shipId, tokenType);
}

function getLockedShipName(targetShipId: string | null): string {
  if (!targetShipId || !props.allShips) return "Unknown";
  const targetShip = props.allShips.find((s) => s.ship.shipId === targetShipId);
  return targetShip?.pilot?.pilotName || "Unknown";
}

function getTokenCount(tokenType: TokenType): number {
  return props.ship.tokens.filter((t) => t.tokenType === tokenType).length;
}

function getTargetLockTokens() {
  return props.ship.tokens.filter((t) => t.tokenType === TokenType.TargetLock);
}

function getCritName(critCardId: string): string {
  if (!cards.value) return critCardId;
  const critCard = cards.value.damageCards.find((c) => c.id === critCardId);
  return critCard?.name || critCardId;
}

</script>

<template>
  <div
    class="mb-2 border border-gray-700 bg-gray-800 hover:border-teal-500 transition-all relative"
  >
    <div class="p-3 cursor-pointer" @click="handleToggle">
      <div class="flex items-start gap-3">
        <!-- Ship Icon & PS -->
        <div class="flex items-center gap-2 shrink-0">
          <span
            v-if="pilot"
            class="xwing-ship text-3xl"
            :class="colorClasses[playerColor]"
          >
            {{ getShipIcon(pilot.shipType) }}
          </span>
          <span class="text-xl font-bold text-orange-500">
            {{ ship.pilotSkill }}
          </span>
        </div>

        <!-- Ship Details -->
        <div class="flex-1 min-w-0">
          <!-- Pilot Name on same line -->
          <div class="flex items-center gap-2 mb-2">
            <div class="text-sm font-semibold text-gray-100">
              {{ pilot?.pilotName || "Unknown" }}
            </div>
          </div>

          <!-- Stats Row -->
          <div class="flex items-center gap-3 text-xs mb-2">
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

          <!-- Tokens -->
          <div v-if="ship.tokens.length > 0 && !isCollapsed" class="flex flex-wrap gap-1 mb-2">
            <div
              v-for="token in ship.tokens"
              :key="`${token.tokenType}-${token.targetShipId || ''}-${token.conditionId || ''}`"
              class="flex items-center gap-1 text-xs px-2 py-0.5 border border-gray-600 bg-gray-700 text-gray-300"
            >
              <span class="xwing-icon text-sm" :class="{
                'text-green-500': token.tokenType === TokenType.Focus || token.tokenType === TokenType.Evade,
                'text-red-500': token.tokenType === TokenType.Stress || token.tokenType === TokenType.Ion,
                'text-yellow-500': token.tokenType === TokenType.TargetLock,
                'text-blue-500': token.tokenType === TokenType.Cloak || token.tokenType === TokenType.Shield,
                'text-orange-500': token.tokenType === TokenType.Condition,
              }">
                {{ 
                  token.tokenType === TokenType.Focus ? TOKEN_ICONS.focus :
                  token.tokenType === TokenType.Evade ? TOKEN_ICONS.evade :
                  token.tokenType === TokenType.Stress ? TOKEN_ICONS.stress :
                  token.tokenType === TokenType.Ion ? TOKEN_ICONS.ion :
                  token.tokenType === TokenType.TargetLock ? TOKEN_ICONS.targetLock :
                  token.tokenType === TokenType.Cloak ? TOKEN_ICONS.cloak :
                  token.tokenType === TokenType.Shield ? TOKEN_ICONS.shield :
                  token.tokenType === TokenType.Condition ? TOKEN_ICONS.condition :
                  token.tokenType === TokenType.Jam ? TOKEN_ICONS.jam :
                  token.tokenType === TokenType.Reinforce ? TOKEN_ICONS.reinforce :
                  token.tokenType === TokenType.Tractor ? TOKEN_ICONS.tractor :
                  token.tokenType === TokenType.WeaponsDisabled ? TOKEN_ICONS.weaponsDisabled :
                  '?'
                }}
              </span>
              <span v-if="token.tokenType === TokenType.TargetLock && token.targetShipId" class="text-gray-400">
                ({{ getLockedShipName(token.targetShipId) }})
              </span>
              <button
                @click.stop="handleRemoveToken(token.tokenType, $event)"
                class="ml-1 text-red-400 hover:text-red-300 font-bold"
                title="Spend token"
              >
                ×
              </button>
            </div>
          </div>

          <!-- Action Bar -->
          <div
            v-if="pilot?.actions && pilot.actions.length > 0 && !isCollapsed"
            class="flex items-center gap-1 mb-2"
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
            v-if="pilot?.ability && !isCollapsed"
            class="text-xs text-gray-400 italic leading-relaxed mb-2"
          >
            {{ pilot.ability }}
          </div>

          <!-- Upgrades (single column) -->
          <div v-if="ship.upgrades.length > 0 && !isCollapsed" class="flex flex-col gap-1 mb-2">
            <button
              v-for="upgradeState in ship.upgrades"
              :key="upgradeState.upgradeId"
              @click="handleUpgradeClick(getUpgrade(upgradeState.upgradeId)!, $event)"
              @mouseenter="handleUpgradeHover(getUpgrade(upgradeState.upgradeId) || null, $event)"
              @mousemove="handleUpgradeHover(getUpgrade(upgradeState.upgradeId) || null, $event)"
              @mouseleave="handleUpgradeLeave"
              class="text-xs px-2 py-1 border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors flex items-center justify-between"
              :class="!upgradeState.faceUp ? 'opacity-50' : ''"
            >
              <span class="flex items-center gap-1">
                <span v-if="!upgradeState.faceUp" class="text-gray-500">[Face Down]</span>
                <span v-else>
                  <span v-if="getUpgrade(upgradeState.upgradeId)?.isUnique" class="xwing-icon text-yellow-500 text-xs">u</span>
                  {{ getUpgrade(upgradeState.upgradeId)?.name || "Unknown" }}
                </span>
              </span>
              <button
                @click.stop="handleFlipUpgrade(upgradeState.upgradeId, upgradeState.faceUp, $event)"
                class="text-gray-400 hover:text-gray-200"
                title="Flip upgrade"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </button>
          </div>

          <!-- Crits -->
          <div v-if="ship.faceUpDamage.length > 0 && !isCollapsed" class="flex flex-col gap-1 mb-2">
            <div
              v-for="crit in ship.faceUpDamage"
              :key="crit.critCardId"
              class="text-xs px-2 py-1 border border-red-600 bg-red-900/30 text-red-300 flex items-center gap-1"
            >
              <span class="xwing-icon text-red-500 text-sm">Ç</span>
              <span>{{ getCritName(crit.critCardId) }}</span>
            </div>
          </div>
        </div>

        <!-- Collapse Button -->
        <button
          @click="handleCollapse"
          class="p-1 hover:bg-gray-700 transition-colors rounded text-gray-400 hover:text-gray-200 shrink-0"
          title="Collapse/Expand"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!isCollapsed"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

      </div>
    </div>

    <!-- Upgrade Card Image Tooltip -->
    <Teleport to="body">
      <div
        v-if="hoveredUpgrade && hoveredUpgrade.cardImageUrl"
        class="fixed z-[60] pointer-events-none"
        :style="{
          left: `${Math.max(20, hoverPosition.x - 400)}px`,
          top: `${Math.max(20, hoverPosition.y - 150)}px`,
        }"
      >
        <img
          :src="hoveredUpgrade.cardImageUrl"
          :alt="hoveredUpgrade.name"
          class="w-64 rounded-lg shadow-2xl border-2 border-gray-300"
        />
      </div>
    </Teleport>

    <!-- Clicked Upgrade Card Modal -->
    <Teleport to="body">
      <div
        v-if="clickedUpgrade && clickedUpgrade.cardImageUrl"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50"
        @click="clickedUpgrade = null"
      >
        <img
          :src="clickedUpgrade.cardImageUrl"
          :alt="clickedUpgrade.name"
          class="max-w-2xl rounded-lg shadow-2xl border-2 border-gray-300"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>
