<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import type { PilotDto, CardsDto } from "#shared/cards";
import { TokenType } from "#shared/enums";
import { TOKEN_ICONS, getShipIcon, STAT_ICONS } from "#shared/xwing-icons";
import { ATTACK_DIE_ICONS } from "#shared/dice";

interface ShipWithPilot {
  ship: ShipStateDto;
  pilot: PilotDto | undefined;
}

const props = defineProps<{
  ship: ShipStateDto;
  allShips: ShipWithPilot[];
}>();

const emit = defineEmits<{
  addToken: [
    shipId: string,
    tokenType: TokenType,
    targetShipId?: string | null,
    conditionId?: string | null
  ];
  removeToken: [shipId: string, tokenType: TokenType];
  addDamage: [shipId: string, isCrit: boolean];
  addStatModifier: [
    shipId: string,
    stat: "hull" | "shields" | "agility" | "attack" | "pilotSkill",
    amount: number
  ];
  assignCrit: [shipId: string, critCardId: string];
  addFacedownDamage: [shipId: string];
  removeFacedownDamage: [shipId: string];
  removeCrit: [shipId: string, critCardId: string];
  flipCritFacedown: [shipId: string, critCardId: string];
  closeTokenManager: [];
}>();

const { cards } = useCards();

const availableTokens: readonly TokenType[] = [
  TokenType.Focus,
  TokenType.Evade,
  TokenType.Stress,
  TokenType.Ion,
  TokenType.TargetLock,
  TokenType.Reinforce,
  TokenType.Cloak,
  TokenType.Jam,
  TokenType.WeaponsDisabled,
  TokenType.Tractor,
  TokenType.Shield,
  TokenType.Condition,
] as const;

const iconMap: Record<TokenType, string> = {
  [TokenType.Focus]: TOKEN_ICONS.focus,
  [TokenType.Evade]: TOKEN_ICONS.evade,
  [TokenType.Stress]: TOKEN_ICONS.stress,
  [TokenType.Ion]: TOKEN_ICONS.ion,
  [TokenType.TargetLock]: TOKEN_ICONS.targetLock,
  [TokenType.Reinforce]: TOKEN_ICONS.reinforce,
  [TokenType.Cloak]: TOKEN_ICONS.cloak,
  [TokenType.Jam]: TOKEN_ICONS.jam,
  [TokenType.Tractor]: TOKEN_ICONS.tractor,
  [TokenType.Shield]: TOKEN_ICONS.shield,
  [TokenType.WeaponsDisabled]: TOKEN_ICONS.weaponsDisabled,
  [TokenType.Condition]: TOKEN_ICONS.condition,
};

const tokenColors: Record<TokenType, string> = {
  [TokenType.Focus]: "text-green-500",
  [TokenType.Evade]: "text-green-500",
  [TokenType.Stress]: "text-red-500",
  [TokenType.Ion]: "text-red-500",
  [TokenType.TargetLock]: "text-yellow-500",
  [TokenType.Reinforce]: "text-green-500",
  [TokenType.Cloak]: "text-blue-500",
  [TokenType.Jam]: "text-green-500",
  [TokenType.Tractor]: "text-red-500",
  [TokenType.Shield]: "text-blue-500",
  [TokenType.WeaponsDisabled]: "text-red-500",
  [TokenType.Condition]: "text-orange-500",
};

const showTargetLockDrawer = ref(false);
const showConditionsDrawer = ref(false);
const hoveredCondition = ref<{ name: string; cardImageUrl?: string } | null>(
  null
);
const hoverPosition = ref({ x: 0, y: 0 });

function getTokenIcon(tokenType: TokenType): string {
  return iconMap[tokenType] || "?";
}

function getTokenColor(tokenType: TokenType): string {
  return tokenColors[tokenType] || "text-gray-300";
}

function getTokenCount(tokenType: TokenType): number {
  return props.ship.tokens.filter((t) => t.tokenType === tokenType).length;
}

function getTargetLockTokens() {
  return props.ship.tokens.filter((t) => t.tokenType === TokenType.TargetLock);
}

function getLockedShipName(targetShipId: string | null): string {
  if (!targetShipId) return "";
  const targetShip = props.allShips.find((s) => s.ship.shipId === targetShipId);
  return targetShip?.pilot?.pilotName || "Unknown";
}

function getOtherShips() {
  return props.allShips.filter(
    (s) => s.ship.shipId !== props.ship.shipId && !s.ship.isDestroyed
  );
}

function handleAddToken(tokenType: TokenType) {
  if (tokenType === TokenType.TargetLock) {
    showTargetLockDrawer.value = true;
    return;
  }
  if (tokenType === TokenType.Condition) {
    showConditionsDrawer.value = true;
    return;
  }
  emit("addToken", props.ship.shipId, tokenType);
}

function handleAddTargetLock(targetShipId: string) {
  emit("addToken", props.ship.shipId, TokenType.TargetLock, targetShipId);
  showTargetLockDrawer.value = false;
}

function handleAddCondition(conditionId: string) {
  emit("addToken", props.ship.shipId, TokenType.Condition, null, conditionId);
  showConditionsDrawer.value = false;
}

function handleRemoveToken(tokenType: TokenType) {
  emit("removeToken", props.ship.shipId, tokenType);
}

function handleClose() {
  emit("closeTokenManager");
}

function handleMouseMove(event: MouseEvent) {
  hoverPosition.value = { x: event.clientX, y: event.clientY };
}

const allConditions = computed(() => {
  if (!cards.value) return [];
  return cards.value.upgrades.filter((u) => u.categoryKey === "condition");
});

function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled: T[] = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp: T = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

function handleAddHullDamage() {
  emit("addFacedownDamage", props.ship.shipId);
}

function handleRemoveFacedownDamage() {
  emit("removeFacedownDamage", props.ship.shipId);
}

async function handleAddCrit() {
  if (!cards.value || !cards.value.damageDeck.length) return;

  const shuffledDeck = shuffleArray(cards.value.damageDeck);
  const critCardId = shuffledDeck[0];

  if (!critCardId) return;

  emit("assignCrit", props.ship.shipId, critCardId);

  const critCard = cards.value.damageCards.find((c) => c.id === critCardId);
  if (critCard?.id === "direct-hit") {
    emit("addFacedownDamage", props.ship.shipId);
  }
}

function handleRemoveCrit(critCardId: string) {
  emit("removeCrit", props.ship.shipId, critCardId);
}

function handleRemoveLastCrit() {
  if (assignedCrits.value.length > 0) {
    const lastCrit = assignedCrits.value[assignedCrits.value.length - 1];
    if (lastCrit) {
      handleRemoveCrit(lastCrit.critCardId);
    }
  }
}

function handleFlipCritFacedown(critCardId: string) {
  emit("flipCritFacedown", props.ship.shipId, critCardId);
}

function handleAddStatModifier(
  stat: "hull" | "shields" | "agility" | "attack" | "pilotSkill",
  amount: number
) {
  emit("addStatModifier", props.ship.shipId, stat, amount);
}

function getDamageCount(): number {
  return props.ship.faceUpDamage.length + props.ship.faceDownDamage;
}

function getTotalHull(): number {
  const pilot = props.allShips.find(
    (s) => s.ship.shipId === props.ship.shipId
  )?.pilot;
  if (!pilot) return props.ship.hull;
  return pilot.hull;
}

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
</script>

<template>
  <div class="h-full flex flex-col relative">
    <div class="p-3 border-b border-gray-700 flex items-center justify-between">
      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Tokens
      </div>
      <button
        @click="handleClose"
        class="p-1 hover:bg-gray-700 transition-colors rounded text-gray-400 hover:text-gray-200"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    <div class="flex-1 overflow-y-auto p-2">
      <div class="space-y-1">
        <!-- Damage Cards Section -->
        <div class="mb-3 pb-3 border-b border-gray-700">
          <div
            class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2"
          >
            Damage Cards
          </div>
          <!-- Hull Damage (Facedown) -->
          <div
            class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors mb-1"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <span class="xwing-icon text-4xl shrink-0 text-red-500">
                {{ ATTACK_DIE_ICONS.hit }}
              </span>
              <span class="text-xs text-gray-300">Hull Damage</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <span class="text-xs text-gray-300 w-6 text-center font-semibold">
                {{ props.ship.faceDownDamage }}
              </span>
              <button
                @click.stop="handleRemoveFacedownDamage"
                :disabled="props.ship.faceDownDamage === 0"
                class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
              >
                -
              </button>
              <button
                @click.stop="handleAddHullDamage"
                class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <!-- Crits -->
          <div
            class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors mb-1"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <span class="xwing-icon text-4xl shrink-0 text-orange-500">
                {{ ATTACK_DIE_ICONS.crit }}
              </span>
              <span class="text-xs text-gray-300">Crits</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <span class="text-xs text-gray-300 w-6 text-center font-semibold">
                {{ assignedCrits.length }}
              </span>
              <button
                @click.stop="handleRemoveLastCrit"
                :disabled="assignedCrits.length === 0"
                class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
              >
                -
              </button>
              <button
                @click.stop="handleAddCrit"
                class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div class="text-xs text-gray-400 mb-2">
            Damage: {{ getDamageCount() }} / Hull: {{ props.ship.hull }} /
            {{ getTotalHull() }}
          </div>
          <div v-if="assignedCrits.length > 0" class="space-y-1">
            <div
              v-for="(crit, index) in assignedCrits"
              :key="`${crit.critCardId}-${index}`"
              class="p-2 bg-gray-800 rounded text-xs"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="font-semibold text-gray-200">
                  {{ crit.card.name }}
                </div>
                <div class="flex items-center gap-1">
                  <button
                    v-if="crit.faceUp"
                    @click.stop="handleFlipCritFacedown(crit.critCardId)"
                    class="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 transition-colors"
                    title="Flip facedown"
                  >
                    Flip
                  </button>
                  <button
                    @click.stop="handleRemoveCrit(crit.critCardId)"
                    class="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-xs text-white transition-colors"
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div class="text-gray-400 leading-relaxed">
                {{ crit.card.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Stat Modifiers Section -->
        <div class="mb-3 pb-3 border-b border-gray-700">
          <div
            class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2"
          >
            Stat Modifiers
          </div>
          <div class="space-y-1">
            <!-- Hull -->
            <div
              class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="xwing-icon text-4xl shrink-0 text-gray-400">{{
                  STAT_ICONS.hull
                }}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span
                  class="text-xs text-gray-300 w-6 text-center font-semibold"
                >
                  {{ props.ship.hull }}
                </span>
                <button
                  @click.stop="handleAddStatModifier('hull', -1)"
                  :disabled="props.ship.hull <= 0"
                  class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                >
                  -
                </button>
                <button
                  @click.stop="handleAddStatModifier('hull', 1)"
                  class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <!-- Shields -->
            <div
              class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="xwing-icon text-4xl shrink-0 text-blue-500">{{
                  STAT_ICONS.shield
                }}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span
                  class="text-xs text-gray-300 w-6 text-center font-semibold"
                >
                  {{ props.ship.shields }}
                </span>
                <button
                  @click.stop="handleAddStatModifier('shields', -1)"
                  :disabled="props.ship.shields <= 0"
                  class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                >
                  -
                </button>
                <button
                  @click.stop="handleAddStatModifier('shields', 1)"
                  class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <!-- Agility -->
            <div
              class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="xwing-icon text-4xl shrink-0 text-green-500">{{
                  STAT_ICONS.agility
                }}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span
                  class="text-xs text-gray-300 w-6 text-center font-semibold"
                >
                  {{ props.ship.agility }}
                </span>
                <button
                  @click.stop="handleAddStatModifier('agility', -1)"
                  :disabled="props.ship.agility <= 0"
                  class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                >
                  -
                </button>
                <button
                  @click.stop="handleAddStatModifier('agility', 1)"
                  class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <!-- Attack -->
            <div
              class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="xwing-icon text-4xl shrink-0 text-red-500">{{
                  STAT_ICONS.attack
                }}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span
                  class="text-xs text-gray-300 w-6 text-center font-semibold"
                >
                  {{ props.ship.attack }}
                </span>
                <button
                  @click.stop="handleAddStatModifier('attack', -1)"
                  :disabled="props.ship.attack <= 0"
                  class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                >
                  -
                </button>
                <button
                  @click.stop="handleAddStatModifier('attack', 1)"
                  class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <!-- Pilot Skill -->
            <div
              class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-xs text-gray-300 font-semibold shrink-0">
                  PS
                </span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span
                  class="text-xs text-gray-300 w-6 text-center font-semibold"
                >
                  {{ props.ship.pilotSkill }}
                </span>
                <button
                  @click.stop="handleAddStatModifier('pilotSkill', -1)"
                  :disabled="props.ship.pilotSkill <= 0"
                  class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                >
                  -
                </button>
                <button
                  @click.stop="handleAddStatModifier('pilotSkill', 1)"
                  class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tokens Section -->
        <div class="mb-2">
          <div
            class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2"
          >
            Tokens
          </div>
        </div>
        <div
          v-for="tokenType in availableTokens"
          :key="`${props.ship.shipId}-${tokenType}`"
          class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span
              class="xwing-icon text-4xl shrink-0"
              :class="getTokenColor(tokenType)"
            >
              {{ getTokenIcon(tokenType) }}
            </span>
            <div
              v-if="
                tokenType === TokenType.TargetLock &&
                getTokenCount(tokenType) > 0
              "
              class="text-xs text-gray-400"
            >
              {{
                getLockedShipName(
                  getTargetLockTokens()[0]?.targetShipId || null
                )
              }}
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span class="text-xs text-gray-300 w-6 text-center font-semibold">
              {{ getTokenCount(tokenType) }}
            </span>
            <button
              @click.stop="handleRemoveToken(tokenType)"
              :disabled="getTokenCount(tokenType) === 0"
              class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
            >
              -
            </button>
            <button
              @click.stop="handleAddToken(tokenType)"
              class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Target Lock Second Drawer -->
    <div
      v-if="showTargetLockDrawer"
      class="absolute inset-0 bg-gray-900 border-l border-gray-700 z-10 flex flex-col"
    >
      <div
        class="p-3 border-b border-gray-700 flex items-center justify-between"
      >
        <div
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
        >
          Select Target
        </div>
        <button
          @click="showTargetLockDrawer = false"
          class="p-1 hover:bg-gray-700 transition-colors rounded text-gray-400 hover:text-gray-200"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <div class="space-y-1">
          <div
            v-for="{ ship, pilot } in getOtherShips()"
            :key="ship.shipId"
            @click="handleAddTargetLock(ship.shipId)"
            class="flex items-center gap-2 p-2 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <span class="xwing-ship text-2xl text-gray-300 shrink-0">
              {{ pilot?.shipType ? getShipIcon(pilot.shipType) : "?" }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-200">
                {{ pilot?.pilotName || "Unknown" }}
              </div>
              <div class="text-xs text-gray-400">PS {{ ship.pilotSkill }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conditions Side Menu -->
    <div
      v-if="showConditionsDrawer"
      class="absolute right-full top-0 bottom-0 w-80 bg-gray-900 border-r border-gray-700 shadow-xl z-20 flex flex-col"
      @mousemove="handleMouseMove"
    >
      <div
        class="p-3 border-b border-gray-700 flex items-center justify-between"
      >
        <div
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
        >
          Conditions
        </div>
        <button
          @click="showConditionsDrawer = false"
          class="p-1 hover:bg-gray-700 transition-colors rounded text-gray-400 hover:text-gray-200"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <div class="space-y-1">
          <div
            v-for="condition in allConditions"
            :key="condition.id"
            @click="handleAddCondition(condition.id)"
            @mouseenter="
              hoveredCondition = {
                name: condition.name,
                cardImageUrl: condition.cardImageUrl,
              }
            "
            @mouseleave="hoveredCondition = null"
            class="flex items-start gap-2 p-2 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <span class="xwing-icon text-2xl text-orange-500 shrink-0">
              {{ TOKEN_ICONS.condition }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-200 mb-1">
                {{ condition.name }}
              </div>
              <div class="text-xs text-gray-400 leading-relaxed">
                {{ condition.rulesText }}
              </div>
            </div>
          </div>
          <div
            v-if="allConditions.length === 0"
            class="text-center py-8 text-gray-400 text-sm"
          >
            No conditions available
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Condition Card Image Tooltip -->
  <Teleport to="body">
    <div
      v-if="hoveredCondition && hoveredCondition.cardImageUrl"
      class="fixed z-60 pointer-events-none"
      :style="{
        left: `${hoverPosition.x + 20}px`,
        top: `${hoverPosition.y - 100}px`,
      }"
    >
      <img
        :src="hoveredCondition.cardImageUrl"
        :alt="hoveredCondition.name"
        class="w-64 rounded-lg shadow-2xl border-2 border-gray-300"
      />
    </div>
  </Teleport>
</template>
