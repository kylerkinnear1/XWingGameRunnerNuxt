<template>
  <div class="relative h-screen w-full overflow-hidden bg-gray-900">
    <div class="flex items-center justify-center p-16">
      <!-- Single centered vertical container -->
      <div class="flex flex-col items-center gap-4 max-w-4xl w-full">
        <!-- Logo and Title - Horizontal Container -->
        <div class="flex items-center justify-center gap-3">
          <img
            src="/xwing_logo.png"
            alt="XWing Gamemaster"
            class="h-16 w-auto"
          />
          <span class="font-bold text-3xl whitespace-nowrap text-white drop-shadow-lg">XWing Gamemaster</span>
        </div>

        <!-- Cover Image with Buttons Overlay -->
        <div class="relative w-full">
          <img
            src="/xwing-cover-art.jpg"
            alt="X-Wing Miniatures"
            class="w-full h-auto rounded-2xl border-4 border-gray-700 shadow-2xl object-contain"
          />
          <!-- Dark overlay for better button visibility -->
          <div class="absolute inset-0 rounded-2xl bg-black/40 pointer-events-none"></div>
          
          <!-- Buttons Centered in Image -->
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <NuxtLink to="/games/new">
              <button class="px-8 py-4 text-lg font-bold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all uppercase tracking-wide shadow-lg hover:shadow-xl min-w-[250px]">
                Start New Game
              </button>
            </NuxtLink>

            <NuxtLink to="/squads">
              <button class="px-8 py-4 text-lg font-bold bg-gray-700 text-white border-b-4 border-gray-900 hover:bg-gray-600 active:border-b-2 transition-all uppercase tracking-wide shadow-lg hover:shadow-xl min-w-[250px]">
                Build Your Squad
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>