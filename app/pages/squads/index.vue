<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left sidebar - Squad List (3 columns) -->
    <div class="lg:col-span-3">
      <SquadList />
    </div>
    
    <!-- Middle - Ship Selection (4 columns) -->
    <div class="lg:col-span-4">
      <SquadShips />
    </div>
    
    <!-- Right side - Edit Form (5 columns) -->
    <div class="lg:col-span-5">
      <EditSquad />
    </div>
  </div>
</template>