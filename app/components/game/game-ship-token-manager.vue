<script setup lang="ts">
import type { ShipStateDto } from "#shared/game-state-dto";
import { TokenType } from "#shared/enums";
import { TOKEN_ICONS } from "#shared/xwing-icons";

const props = defineProps<{
  ship: ShipStateDto;
}>();

const emit = defineEmits<{
  addToken: [shipId: string, tokenType: TokenType];
  removeToken: [shipId: string, tokenType: TokenType];
  closeTokenManager: [];
}>();

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

function getTokenIcon(tokenType: TokenType): string {
  return iconMap[tokenType] || "?";
}

function getTokenCount(tokenType: TokenType): number {
  return props.ship.tokens.filter((t) => t.tokenType === tokenType).length;
}

function formatTokenName(tokenType: TokenType): string {
  return tokenType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function handleAddToken(tokenType: TokenType) {
  emit("addToken", props.ship.shipId, tokenType);
}

function handleRemoveToken(tokenType: TokenType) {
  emit("removeToken", props.ship.shipId, tokenType);
}

function handleClose() {
  emit("closeTokenManager");
}
</script>

<template>
  <div class="h-full flex flex-col">
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
        <div
          v-for="tokenType in availableTokens"
          :key="`${props.ship.shipId}-${tokenType}`"
          class="flex items-center justify-between p-2 hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="xwing-icon text-lg text-gray-300 shrink-0">
              {{ getTokenIcon(tokenType) }}
            </span>
            <span class="text-xs text-gray-400 truncate">
              {{ formatTokenName(tokenType) }}
            </span>
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
  </div>
</template>
