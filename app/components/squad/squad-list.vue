<script setup lang="ts">
import type {
  SquadReadResponseDto,
  SquadUpdateResponseDto,
} from "#shared/squad-dto";
import { Faction, factionOptions } from "#shared/enums";

const {
  selectedSquad,
  selectSquad,
  hasUnsavedChanges,
  closeDrawer,
  registerRefresh,
  pointLimit,
} = useSquadEditor();
const {
  data: response,
  pending,
  error,
  refresh,
} = await useFetch<SquadReadResponseDto>("/api/squads");

// Register refresh function so other components can trigger it
onMounted(() => {
  registerRefresh(refresh);
});

const selectedFaction = ref<Faction>(Faction.Rebel);
const creating = ref(false);
const createError = ref<string | null>(null);
const deleting = ref<string | null>(null);
const deleteError = ref<string | null>(null);

// Toast for delete confirmation
const toast = useToast();

// Faction change confirmation modal state
const showFactionChangeModal = ref(false);
const pendingFaction = ref<Faction | null>(null);

// Filter squads by selected faction
const filteredSquads = computed(() => {
  if (!response.value) return [];
  return response.value.squads.filter(
    (s) => s.faction === selectedFaction.value
  );
});

async function handleFactionChange(event: Event) {
  const newFaction = (event.target as HTMLSelectElement).value as Faction;

  if (newFaction === selectedFaction.value) return;

  if (hasUnsavedChanges.value) {
    pendingFaction.value = newFaction;
    showFactionChangeModal.value = true;
  } else {
    closeDrawer();
    selectedFaction.value = newFaction;
  }
}

function confirmFactionChange() {
  if (pendingFaction.value) {
    closeDrawer();
    selectedFaction.value = pendingFaction.value;
    pendingFaction.value = null;
  }
  showFactionChangeModal.value = false;
}

function cancelFactionChange() {
  pendingFaction.value = null;
  showFactionChangeModal.value = false;
  nextTick(() => {
    const select = document.getElementById("faction") as HTMLSelectElement;
    if (select) {
      select.value = selectedFaction.value;
    }
  });
}

async function createEmptySquad() {
  creating.value = true;
  createError.value = null;

  try {
    const factionNames = new Map([
      [Faction.Empire, "Imperial Fleet"],
      [Faction.Rebel, "Rebel Squadron"],
    ]);

    const result = await $fetch<SquadUpdateResponseDto>("/api/squads", {
      method: "POST",
      body: {
        name: factionNames.get(selectedFaction.value) || "Hired Guns",
        faction: selectedFaction.value,
      },
    });

    await refresh();

    const newSquad = response.value?.squads.find((s) => s.id === result.id);
    if (newSquad) {
      selectSquad(newSquad);
    }
  } catch (e: any) {
    createError.value = e.data?.message || "Failed to create squad";
  } finally {
    creating.value = false;
  }
}

async function handleDelete(squadId: string, squadName: string) {
  if (
    !confirm(
      `Are you sure you want to delete "${squadName}"? This action cannot be undone.`
    )
  ) {
    return;
  }

  deleting.value = squadId;
  deleteError.value = null;

  try {
    await $fetch(`/api/squads/${squadId}`, {
      method: "DELETE",
    });

    if (selectedSquad.value?.id === squadId) {
      closeDrawer();
    }

    await refresh();

    toast.add({
      title: "Squad deleted",
      description: `"${squadName}" has been deleted.`,
      color: "success",
    });
  } catch (e: any) {
    const errorMessage = e.data?.message || "Failed to delete squad";
    deleteError.value = errorMessage;

    toast.add({
      title: "Delete failed",
      description: errorMessage,
      color: "error",
    });
  } finally {
    deleting.value = null;
  }
}

function handleSquadClick(squad: any) {
  // Force reactivity by using nextTick
  nextTick(() => {
    selectSquad(squad);
  });
}

defineExpose({
  refresh,
});
</script>
<template>
  <div class="h-full flex flex-col bg-gray-800">
    <div class="p-4 border-b border-gray-700 bg-gray-900">
      <div class="mb-3">
        <label
          for="faction"
          class="block text-xs font-medium mb-1.5 uppercase tracking-wide text-gray-400"
        >
          Faction
        </label>
        <select
          id="faction"
          :value="selectedFaction"
          @change="handleFactionChange"
          class="w-full px-3 py-2 text-sm border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-800 text-gray-100"
        >
          <option
            v-for="option in factionOptions"
            :key="option.value"
            :value="option.value"
            class="flex items-center gap-2"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <AppButton
        variant="primary"
        size="md"
        :disabled="creating"
        @click="createEmptySquad"
        class="w-full"
      >
        {{ creating ? "Creating..." : "Create New Squad" }}
      </AppButton>

      <div v-if="createError" class="mt-2 text-xs text-red-400">
        {{ createError }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-gray-800">
      <div class="p-4">
        <h2
          class="text-sm font-bold mb-3 uppercase tracking-wide text-gray-400"
        >
          Your Squads
        </h2>

        <div v-if="pending" class="text-center py-8 text-gray-400">
          Loading squads...
        </div>

        <div
          v-else-if="error"
          class="p-4 bg-red-900 border border-red-700 text-red-200"
        >
          Failed to load squads
        </div>

        <div v-else-if="filteredSquads.length === 0" class="text-center py-8">
          <p class="text-gray-400 mb-2">No {{ selectedFaction }} squads yet</p>
          <p class="text-sm text-gray-500">
            Click "Create New Squad" to get started
          </p>
        </div>

        <div v-else class="space-y-2">
          <div v-for="squad in filteredSquads" :key="squad.id" class="group">
            <div @click="handleSquadClick(squad)">
              <SquadCard
                :squad="squad"
                :isSelected="selectedSquad?.id === squad.id"
                :pointLimit="pointLimit"
              />
            </div>

            <!-- Action Drawer (slides down vertically on hover) -->
            <div
              class="h-0 overflow-hidden transition-all duration-200 group-hover:h-12"
            >
              <div class="flex items-center justify-center gap-2 pt-2">
                <button
                  @click.stop="handleDelete(squad.id, squad.name)"
                  :disabled="deleting === squad.id"
                  class="px-4 py-2 bg-red-900/90 text-red-200 hover:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Delete squad"
                >
                  <svg
                    v-if="deleting !== squad.id"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span class="text-xs font-semibold">DELETE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
