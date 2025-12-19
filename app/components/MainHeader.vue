<template>
  <header class="flex items-center justify-between px-4 py-2 border-b">
    <div class="flex items-center gap-3">
      <NuxtLink to="/" class="font-bold">XWing Gamemaster</NuxtLink>

      <div class="ms-4">
        <UNavigationMenu :items="items" class="w-full" content-orientation="vertical" />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <TemplateMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import TemplateMenu from './TemplateMenu.vue'

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Games',
    children: [
      { label: 'Start New Game', to: '/games/new' },
      { label: 'Resume Game', to: '/games/resume' }
    ]
  },
  {
    label: 'Lists',
    children: [
      { label: 'Create List', to: '/lists/new' },
      { label: 'View Lists', to: '/lists/view' }
    ]
  }
])

</script>