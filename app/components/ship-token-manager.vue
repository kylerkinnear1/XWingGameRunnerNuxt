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
}>();

const availableTokens = [
  TokenType.Focus,
  TokenType.Evade,
  TokenType.Stress,
  TokenType.Ion,
  TokenType.TargetLock,
  TokenType.Reinforce,
  TokenType.Cloak,
  TokenType.Jam,
  TokenType.Calculate,
  TokenType.Charge,
  TokenType.Force,
  TokenType.Disarm,
  TokenType.Tractor,
  TokenType.Strain,
  TokenType.Deplete,
  TokenType.Shield,
] as const;

function getTokenIcon(tokenType: TokenType): string {
  const iconMap: Record<string, string> = {
    [TokenType.Focus]: TOKEN_ICONS.focus,
    [TokenType.Evade]: TOKEN_ICONS.evade,
    [TokenType.Stress]: TOKEN_ICONS.stress,
    [TokenType.Ion]: TOKEN_ICONS.ion,
    [TokenType.TargetLock]: TOKEN_ICONS.targetLock,
    [TokenType.Reinforce]: TOKEN_ICONS.reinforce,
    [TokenType.Cloak]: TOKEN_ICONS.cloak,
    [TokenType.Jam]: TOKEN_ICONS.jam,
    [TokenType.Calculate]: TOKEN_ICONS.calculate,
    [TokenType.Charge]: TOKEN_ICONS.charge,
    [TokenType.Force]: TOKEN_ICONS.force,
    [TokenType.Disarm]: TOKEN_ICONS.disarm,
    [TokenType.Tractor]: TOKEN_ICONS.tractor,
    [TokenType.Strain]: TOKEN_ICONS.strain,
    [TokenType.Deplete]: TOKEN_ICONS.deplete,
    [TokenType.Shield]: TOKEN_ICONS.shield,
  };
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
</script>

<template>
  <div class="border-t border-gray-700 p-3 bg-gray-900">
    <div class="text-xs font-semibold text-gray-400 mb-2">Tokens</div>
    <div class="space-y-2">
      <div
        v-for="tokenType in availableTokens"
        :key="tokenType"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <span class="xwing-icon text-lg text-gray-300">
            {{ getTokenIcon(tokenType) }}
          </span>
          <span class="text-xs text-gray-400">
            {{ formatTokenName(tokenType) }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-300 w-6 text-center">
            {{ getTokenCount(tokenType) }}
          </span>
          <button
            @click.stop="handleAddToken(tokenType)"
            class="w-6 h-6 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded transition-colors"
          >
            +
          </button>
          <button
            @click.stop="handleRemoveToken(tokenType)"
            :disabled="getTokenCount(tokenType) === 0"
            class="w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded transition-colors"
          >
            -
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
