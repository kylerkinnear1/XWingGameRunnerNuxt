<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-semibold">Create New Game</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- LEFT: Your Squads -->
      <section>
        <h2 class="text-lg font-medium mb-2">Your Squads</h2>

        <div v-if="mySquadsPending">Loading squads…</div>

        <div v-else-if="!mySquads?.length" class="text-sm text-gray-500">
          You don’t have any squads yet.
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="squad in mySquads"
            :key="squad.id"
            class="flex items-center gap-2"
          >
            <input
              type="radio"
              name="mySquad"
              :value="squad.id"
              v-model="mySquadId"
            />
            <span>{{ squad.name }}</span>
          </li>
        </ul>
      </section>

      <!-- RIGHT: Opponent -->
      <section>
        <!-- Email Search -->
        <form class="flex gap-2 mb-4" @submit.prevent="searchOpponent">
          <input
            v-model="opponentEmail"
            type="email"
            placeholder="Opponent email"
            class="flex-1 border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            class="px-4 py-2 border rounded"
            :disabled="opponentSearchPending"
          >
            Search
          </button>
        </form>

        <!-- Errors -->
        <p v-if="opponentError" class="text-sm text-red-600 mb-2">
          {{ opponentError }}
        </p>

        <!-- Opponent Squads -->
        <div v-if="opponentSquads.length">
          <h3 class="font-medium mb-2">Opponent Squads</h3>

          <ul class="space-y-2">
            <li
              v-for="squad in opponentSquads"
              :key="squad.id"
              class="flex items-center gap-2"
            >
              <input
                type="radio"
                name="opponentSquad"
                :value="squad.id"
                v-model="opponentSquadId"
              />
              <span>{{ squad.name }}</span>
            </li>
          </ul>
        </div>

        <p
          v-else-if="opponentUserId && !opponentSearchPending"
          class="text-sm text-gray-500"
        >
          This user has no squads.
        </p>
      </section>
    </div>

    <!-- CREATE -->
    <div class="pt-6 border-t flex justify-end">
      <button
        class="px-6 py-3 rounded font-semibold"
        :disabled="!canCreateGame || createPending"
        @click="createGame"
      >
        Create Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { SquadReadResponseDto, SquadReadDto } from "#shared/squad-dto";

/* ---------------------------------------------
 * State
 * ------------------------------------------- */

const router = useRouter();

const mySquadId = ref<string | null>(null);

const opponentEmail = ref("");
const opponentUserId = ref<string | null>(null);
const opponentSquads = ref<SquadReadDto[]>([]);
const opponentSquadId = ref<string | null>(null);

const opponentError = ref<string | null>(null);

/* ---------------------------------------------
 * Load my squads
 * ------------------------------------------- */

const { data: mySquadsResponse, pending: mySquadsPending } =
  await useFetch<SquadReadResponseDto>("/api/squads");

const mySquads = computed(() => mySquadsResponse.value?.squads ?? []);

/* ---------------------------------------------
 * Opponent search
 * ------------------------------------------- */

const opponentSearchPending = ref(false);

async function searchOpponent() {
  opponentError.value = null;
  opponentSquads.value = [];
  opponentSquadId.value = null;
  opponentUserId.value = null;

  opponentSearchPending.value = true;

  try {
    const response = await $fetch<SquadReadResponseDto>("/api/squads", {
      query: { email: opponentEmail.value },
    });

    const firstSquad = response.squads[0];
    if (firstSquad) {
      opponentUserId.value = firstSquad.userId;
      opponentSquads.value = [...response.squads];
    } else {
      opponentError.value = "This user has no squads";
    }
  } catch (err) {
    const error = err as { data?: { message?: string }; message?: string };
    opponentError.value =
      error?.data?.message ?? error?.message ?? "User not found";
  } finally {
    opponentSearchPending.value = false;
  }
}

/* ---------------------------------------------
 * Create game
 * ------------------------------------------- */

const createPending = ref(false);

const canCreateGame = computed(
  () => !!mySquadId.value && !!opponentUserId.value && !!opponentSquadId.value
);

interface CreateGameResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

async function createGame() {
  if (!canCreateGame.value) return;

  createPending.value = true;

  try {
    const game = await $fetch<CreateGameResponse>("/api/games", {
      method: "POST",
      body: {
        player1SquadId: mySquadId.value,
        player2Id: opponentUserId.value,
        player2SquadId: opponentSquadId.value,
      },
    });

    router.push(`/games/${game.id}`);
  } finally {
    createPending.value = false;
  }
}
</script>
