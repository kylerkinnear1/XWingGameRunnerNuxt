<template>
  <header class="border-b border-gray-700 bg-gray-800">
    <div class="px-6 py-2">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-2 py-2">
          <img
            src="/xwing_logo.png"
            alt="XWing Gamemaster"
            class="h-10 w-auto shrink-0"
          />
          <span class="font-bold text-lg whitespace-nowrap text-gray-100"
            >XWing Gamemaster</span
          >
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
          class="shrink-0 px-4 py-2 border border-gray-700 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition-colors"
        >
          Login / Sign up
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { NavigationMenuItem } from "@nuxt/ui";

const items = ref<NavigationMenuItem[]>([
  {
    label: "Games",
    to: "/games",
  },
  {
    label: "Squads",
    to: "/squads/",
  },
]);
</script>
