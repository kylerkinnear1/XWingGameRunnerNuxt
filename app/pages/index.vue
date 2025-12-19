<script setup lang="ts">
import type { SquadReadResponseDto } from '~~/shared/squad-dto';

const { data, pending, error } = useFetch<SquadReadResponseDto>('/api/squads');
</script>
<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error occured: {{ error }}</div>
    <div v-else-if="data && data.squads.length === 0">
      You don't have any lists! Lets create one!
      <br />
      <NuxtLink to="/squads/new">
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
