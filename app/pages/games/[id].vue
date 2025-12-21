<script setup lang="ts">
const route = useRoute();
const gameId = route.params.id as string;
</script>

<template>
  <div>
    <h1>Game {{ gameId }}</h1>
  </div>
</template>
