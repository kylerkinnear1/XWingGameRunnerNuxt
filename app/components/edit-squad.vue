<script setup lang="ts">
import type { SquadUpdateDto, SquadUpdateResponseDto } from '#shared/squad-dto';
import { Faction, factionOptions } from '#shared/enums';

const { selectedSquad, refreshList } = useSquadEditor();

const form = ref<SquadUpdateDto>({
    name: '',
    faction: Faction.Rebel
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const isEditing = computed(() => !!selectedSquad.value);

watch(selectedSquad, (squad) => {
    if (squad) {
        form.value = {
            name: squad.name,
            faction: squad.faction
        };
        error.value = null;
        success.value = false;
    }
}, { immediate: true });

async function saveSquad() {
    error.value = null;
    success.value = false;
    loading.value = true;

    try {
        await $fetch(`/api/squads/${selectedSquad.value!.id}`, {
            method: 'PUT',
            body: form.value
        });
    
        success.value = true;
    
        // Refresh the list to show updated data
        await refreshList();
    } catch (e: any) {
        error.value = e.data?.message || 'Failed to save squad';
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">
        {{ isEditing ? 'Edit Squad' : 'Select a Squad' }}
    </h1>

    <div v-if="!isEditing" class="text-center py-12 text-gray-500">
        <p>Select a squad from the list or create a new one</p>
    </div>

    <form v-else @submit.prevent="saveSquad" class="space-y-6">
        <div>
        <label for="name" class="block text-sm font-medium mb-2">
            Squad Name
        </label>
        <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter squad name"
        />
        </div>

        <div>
        <label for="faction" class="block text-sm font-medium mb-2">
            Faction
        </label>
        <select
            id="faction"
            v-model="form.faction"
            required
            disabled
            class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
        >
            <option
            v-for="option in factionOptions"
            :key="option.value"
            :value="option.value"
            >
            {{ option.label }}
            </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Faction cannot be changed after creation</p>
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ error }}
        </div>

        <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        Squad updated successfully!
        </div>

        <div class="flex gap-4">
        <button
            type="submit"
            :disabled="loading || !form.name"
            class="app-button"
        >
            {{ loading ? 'Saving...' : 'Update Squad' }}
        </button>
        </div>
    </form>
    </div>
</template>