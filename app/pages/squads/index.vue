<script setup lang="ts">
const { selectedSquad } = useSquadEditor();
const isShipDrawerOpen = computed(() => !!selectedSquad.value);
</script>

<template>
  <div class="flex h-full overflow-hidden bg-gray-900">
    <!-- Left sidebar - Squad List (fixed) -->
    <div class="w-80 flex-shrink-0 border-r border-gray-700 bg-gray-800 overflow-y-auto">
      <SquadList />
    </div>
    
    <!-- Ship Drawer - slides out when squad selected (contains ship grid + pilot drawer) -->
    <SquadShips v-if="isShipDrawerOpen" />
    
    <!-- Right side - Edit Form (slides as drawers open) -->
    <div class="flex-1 bg-gray-900 overflow-y-auto">
      <EditSquad />
    </div>
  </div>
</template>