<script setup lang="ts">
import type { GameSummaryResponseDto } from "#shared/game-dto";
import type { SquadReadResponseDto, SquadReadDto } from "#shared/squad-dto";
import { getShipIcon } from "#shared/xwing-icons";

const router = useRouter();
const { cards } = useCards();

// Fetch games
const {
  data: gamesResponse,
  pending: gamesPending,
  error: gamesError,
  refresh: refreshGames,
} = await useFetch<GameSummaryResponseDto>("/api/games");

// Fetch my squads
const { data: mySquadsResponse, pending: mySquadsPending } =
  await useFetch<SquadReadResponseDto>("/api/squads");

const mySquads = computed(() => mySquadsResponse.value?.squads ?? []);

// Selected game or 'new' for creating new game
const selectedId = ref<string | "new" | null>("new");

// Squads mapped by ID for quick lookup (includes fetched squads)
const squadsById = ref<Map<string, SquadReadDto>>(new Map());

// Initialize with my squads
watch(
  mySquads,
  (squads) => {
    squads.forEach((s) => squadsById.value.set(s.id, s));
  },
  { immediate: true }
);

// Fetch squads for games that we don't have yet
async function fetchSquadIfNeeded(squadId: string) {
  if (squadsById.value.has(squadId)) return;

  try {
    const response = await $fetch<SquadReadResponseDto>(
      `/api/squads/${squadId}`
    );
    const squad = response.squads[0];
    if (squad) {
      squadsById.value.set(squadId, squad);
    }
  } catch (error) {
    console.error(`Failed to fetch squad ${squadId}:`, error);
  }
}

// Fetch all squads for games when games are loaded
watch(
  gamesResponse,
  async (games) => {
    if (!games) return;

    const squadIds = new Set<string>();
    games.games.forEach((game) => {
      squadIds.add(game.player1SquadId);
      squadIds.add(game.player2SquadId);
    });

    await Promise.all(Array.from(squadIds).map(fetchSquadIfNeeded));
  },
  { immediate: true }
);

// Get squad details for each game
const gamesWithSquads = computed(() => {
  if (!gamesResponse.value || !cards.value) return [];

  return gamesResponse.value.games.map((game) => {
    const player1Squad = squadsById.value.get(game.player1SquadId);
    const player2Squad = squadsById.value.get(game.player2SquadId);

    // Extract ship types for player 1
    const player1Ships =
      player1Squad?.ships
        .map((ship) => {
          const pilot = cards.value!.pilots.find((p) => p.id === ship.pilotId);
          return pilot?.shipType || "";
        })
        .filter(Boolean) || [];

    // Extract ship types for player 2
    const player2Ships =
      player2Squad?.ships
        .map((ship) => {
          const pilot = cards.value!.pilots.find((p) => p.id === ship.pilotId);
          return pilot?.shipType || "";
        })
        .filter(Boolean) || [];

    return {
      game,
      player1Squad,
      player2Squad,
      player1Name: player1Squad?.name || "Unknown Squad",
      player2Name: player2Squad?.name || "Unknown Squad",
      player1Ships,
      player2Ships,
    };
  });
});

const selectedGame = computed(() => {
  if (selectedId.value === "new" || !selectedId.value) return null;
  return gamesWithSquads.value.find((g) => g.game.id === selectedId.value);
});

// New game form state
const mySquadId = ref<string | null>(null);
const opponentEmail = ref("");
const opponentUserId = ref<string | null>(null);
const opponentSquads = ref<SquadReadDto[]>([]);
const opponentSquadId = ref<string | null>(null);
const opponentError = ref<string | null>(null);
const opponentSearchPending = ref(false);
const createPending = ref(false);
const pointLimit = ref(100);

const canCreateGame = computed(
  () => !!mySquadId.value && !!opponentUserId.value && !!opponentSquadId.value
);

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

    await refreshGames();
    selectedId.value = game.id;

    // Reset form
    mySquadId.value = null;
    opponentEmail.value = "";
    opponentUserId.value = null;
    opponentSquads.value = [];
    opponentSquadId.value = null;
  } finally {
    createPending.value = false;
  }
}

function continueGame() {
  if (selectedId.value && selectedId.value !== "new") {
    router.push(`/games/${selectedId.value}`);
  }
}
</script>

<template>
  <div class="flex h-full overflow-hidden bg-gray-900">
    <!-- Left sidebar - Game List -->
    <div
      class="w-80 shrink-0 border-r border-gray-700 bg-gray-800 overflow-y-auto"
    >
      <div class="p-4 border-b border-gray-700 bg-gray-900">
        <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">
          Games
        </h2>
      </div>

      <div class="p-2">
        <!-- New Game Card -->
        <div
          @click="selectedId = 'new'"
          class="mb-2 p-4 border transition-all cursor-pointer"
          :class="[
            selectedId === 'new'
              ? 'border-teal-500 bg-gray-700 border-l-4'
              : 'border-gray-700 bg-gray-800 hover:bg-gray-750 border-l-2',
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="text-2xl">➕</div>
            <div>
              <div class="text-sm font-semibold text-teal-400">New Game</div>
              <div class="text-xs text-gray-500">Start a new match</div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="gamesPending" class="text-center py-8 text-gray-400 text-sm">
          Loading games...
        </div>

        <!-- Error State -->
        <div
          v-else-if="gamesError"
          class="p-4 bg-red-900 border border-red-700 text-red-200 text-sm"
        >
          Failed to load games
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!gamesWithSquads.length"
          class="text-center py-8 text-gray-500 text-sm"
        >
          <p class="mb-1">No games yet</p>
          <p class="text-xs">Click "New Game" to begin</p>
        </div>

        <!-- Games List -->
        <div v-else class="space-y-2">
          <div
            v-for="item in gamesWithSquads"
            :key="item.game.id"
            @click="selectedId = item.game.id"
          >
            <GameCard
              :game="item.game"
              :player1Name="item.player1Name"
              :player2Name="item.player2Name"
              :player1Ships="item.player1Ships"
              :player2Ships="item.player2Ships"
              :isSelected="selectedId === item.game.id"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Detail Panel -->
    <div class="flex-1 bg-gray-900 overflow-y-auto">
      <!-- New Game Form -->
      <div v-if="selectedId === 'new'" class="p-6 max-w-4xl">
        <h2 class="text-2xl font-bold text-gray-100 mb-6">Create New Game</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Your Squads -->
          <section>
            <h3 class="text-lg font-semibold text-gray-100 mb-3">Your Squad</h3>

            <div v-if="mySquadsPending" class="text-gray-400">
              Loading squads…
            </div>

            <div v-else-if="!mySquads?.length" class="text-sm text-gray-500">
              You don't have any squads yet.
              <NuxtLink to="/squads" class="text-teal-400 hover:text-teal-300"
                >Create one first</NuxtLink
              >.
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="squad in mySquads"
                :key="squad.id"
                @click="mySquadId = squad.id"
                class="cursor-pointer"
              >
                <SquadCard
                  :squad="squad"
                  :isSelected="mySquadId === squad.id"
                  :pointLimit="pointLimit"
                />
              </div>
            </div>
          </section>

          <!-- Opponent -->
          <section>
            <!-- Email Search -->
            <form class="flex gap-2 mb-4" @submit.prevent="searchOpponent">
              <input
                v-model="opponentEmail"
                type="email"
                placeholder="Opponent email"
                class="flex-1 px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
              <button
                type="submit"
                class="px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600 transition-colors"
                :disabled="opponentSearchPending"
              >
                {{ opponentSearchPending ? "Searching..." : "Search" }}
              </button>
            </form>

            <!-- Errors -->
            <p v-if="opponentError" class="text-sm text-red-400 mb-3">
              {{ opponentError }}
            </p>

            <!-- Opponent Squads -->
            <div v-if="opponentSquads.length">
              <div class="space-y-2">
                <div
                  v-for="squad in opponentSquads"
                  :key="squad.id"
                  @click="opponentSquadId = squad.id"
                  class="cursor-pointer"
                >
                  <SquadCard
                    :squad="squad"
                    :isSelected="opponentSquadId === squad.id"
                    :pointLimit="pointLimit"
                  />
                </div>
              </div>
            </div>

            <p
              v-else-if="opponentUserId && !opponentSearchPending"
              class="text-sm text-gray-500"
            >
              This user has no squads.
            </p>
          </section>
        </div>

        <!-- Create Button -->
        <div class="mt-8 pt-6 border-t border-gray-700">
          <button
            class="px-8 py-3 text-sm font-bold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            :disabled="!canCreateGame || createPending"
            @click="createGame"
          >
            {{ createPending ? "Creating..." : "Create Game" }}
          </button>
        </div>
      </div>

      <!-- Game Summary -->
      <div v-else-if="selectedGame" class="p-6 max-w-4xl">
        <h2 class="text-2xl font-bold text-gray-100 mb-6">Game Summary</h2>

        <div class="space-y-6">
          <!-- Match Info -->
          <div class="p-6 border border-gray-700 bg-gray-800">
            <div class="text-sm text-gray-400 mb-4">
              Created:
              {{ new Date(selectedGame.game.createdAt).toLocaleString() }}
            </div>

            <div class="grid grid-cols-2 gap-8">
              <!-- Player 1 -->
              <div>
                <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Player 1
                </div>
                <div class="font-semibold text-gray-100 mb-3">
                  {{ selectedGame.player1Squad?.name || "Unknown Squad" }}
                </div>
                <div
                  v-if="selectedGame.player1Squad && cards"
                  class="flex gap-2 flex-wrap"
                >
                  <span
                    v-for="(ship, index) in selectedGame.player1Squad.ships"
                    :key="index"
                    class="xwing-ship text-red-400 text-4xl"
                  >
                    {{
                      getShipIcon(
                        cards.pilots.find((p) => p.id === ship.pilotId)
                          ?.shipType || ""
                      )
                    }}
                  </span>
                </div>
              </div>

              <!-- Player 2 -->
              <div>
                <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Player 2
                </div>
                <div class="font-semibold text-gray-100 mb-3">
                  {{ selectedGame.player2Squad?.name || "Unknown Squad" }}
                </div>
                <div
                  v-if="selectedGame.player2Squad && cards"
                  class="flex gap-2 flex-wrap"
                >
                  <span
                    v-for="(ship, index) in selectedGame.player2Squad.ships"
                    :key="index"
                    class="xwing-ship text-gray-400 text-4xl"
                  >
                    {{
                      getShipIcon(
                        cards.pilots.find((p) => p.id === ship.pilotId)
                          ?.shipType || ""
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Continue Button -->
          <div>
            <button
              @click="continueGame"
              class="px-8 py-3 text-sm font-bold bg-teal-600 text-white border-b-4 border-teal-800 hover:bg-teal-500 active:border-b-2 transition-all uppercase tracking-wide"
            >
              Continue Game
            </button>
          </div>
        </div>
      </div>

      <!-- No Selection -->
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <p class="mb-2">No game selected</p>
          <p class="text-sm">Select a game or create a new one</p>
        </div>
      </div>
    </div>
  </div>
</template>
