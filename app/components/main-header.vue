<template>
  <header class="border-b">
    <div class="px-8 py-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-2 py-3">
          <img
            src="/xwing_logo.png"
            alt="XWing Gamemaster"
            class="h-12 w-auto shrink-0"
          />
          <span class="font-bold whitespace-nowrap">XWing Gamemaster</span>
        </NuxtLink>

        <div class="min-w-0 flex-1 px-6">
          <UNavigationMenu
            :items="items"
            content-orientation="vertical"
            class="w-full"
          />
        </div>

        <NuxtLink
          to="/login"
          class="shrink-0 px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-100"
        >
          Login / Sign up
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

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