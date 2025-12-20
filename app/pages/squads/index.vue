<script setup lang="ts">
import type { PilotDto } from '#shared/cards';

interface ShipGroup {
  shipKey: string;
  shipName: string;
  pilots: PilotDto[];
}

const { selectedSquad } = useSquadEditor();
const { cards, loadCards, getPilotsForFaction, groupPilotsByShip } = useCards();

const shipGroups = ref<ShipGroup[]>([]);

// Load cards on mount
onMounted(async () => {
  await loadCards();
});

// Watch for squad selection and load ships
watch([selectedSquad, cards], ([squad, cardsData]) => {
  if (squad && cardsData) {
    const pilots = getPilotsForFaction(squad.faction);
    const grouped = groupPilotsByShip(pilots);
    
    shipGroups.value = Array.from(grouped.entries()).map(
      ([shipKey, pilots]: [string, PilotDto[]]) => ({
        shipKey,
        shipName: pilots[0]?.shipType || 'Unknown Ship',
        pilots
      })
    );
  } else {
    shipGroups.value = [];
  }
}, { immediate: true });

// Only show ship drawer when squad is selected
const showShipDrawer = computed(() => {
  return !!selectedSquad.value;
});
</script>

<template>
  <div class="flex h-full overflow-hidden bg-gray-900">
    <!-- Left sidebar - Squad List (fixed) -->
    <div class="w-80 flex-shrink-0 border-r border-gray-700 bg-gray-800 overflow-y-auto">
      <SquadList />
    </div>
    
    <!-- Ship Drawer - contains ship grid + pilot drawer (pilot drawer slides) -->
    <SquadShips 
      v-if="showShipDrawer" 
      :ship-groups="shipGroups"
      :squad-name="selectedSquad?.name || ''"
    />
    
    <!-- Right side - Edit Form -->
    <div class="flex-1 bg-gray-900 overflow-y-auto">
      <EditSquad />
    </div>
  </div>
</template>