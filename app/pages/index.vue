<script setup lang="ts">
import type { IndexDto } from '#shared/indexDto';

const { data, pending, error } = useFetch<IndexDto>('/api/games');
</script>
<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error occured: {{ error }}</div>
    <div v-else-if="data && data.squads.length === 0">
      You don't have any lists! Lets create one!
      <br />
      <NuxtLink to="/lists/new">
        <button class="app-button">Create List</button>
      </NuxtLink>
    </div>
    <div v-else-if="data && data.squads.length > 0">
      <ul>
        <li v-for="squad in data.squads" :key="squad.id">
          {{ squad.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
