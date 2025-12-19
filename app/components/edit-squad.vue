<script setup lang="ts">
import type { SquadUpdateDto, SquadUpdateResponseDto } from '#shared/squad-dto';
import { Faction, factionOptions } from '#shared/enums';

const form = ref<SquadUpdateDto>({
    name: '',
    faction: Faction.Rebel
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const initialFormState = (): SquadUpdateDto => ({
    name: '',
    faction: Faction.Rebel
});

function resetForm() {
    form.value = initialFormState();
    error.value = null;
    success.value = false;
}

async function createSquad() {
    error.value = null;
    success.value = false;
    loading.value = true;

    try {
    const result = await $fetch<SquadUpdateResponseDto>('/api/squads', {
        method: 'POST',
        body: form.value
    });

    success.value = true;
    resetForm();
    
    // Keep success message visible
    success.value = true;
    } catch (e: any) {
    error.value = e.data?.message || 'Failed to create squad';
    } finally {
    loading.value = false;
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Create New Squad</h1>

    <form @submit.prevent="createSquad" class="space-y-6">
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
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
            <option
            v-for="option in factionOptions"
            :key="option.value"
            :value="option.value"
            >
            {{ option.label }}
            </option>
        </select>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        Squad created successfully!
        </div>

        <div class="flex gap-4">
        <button
            type="submit"
            :disabled="loading || !form.name"
            class="app-button"
        >
            {{ loading ? 'Creating...' : 'Create Squad' }}
        </button>

        <NuxtLink to="/lists/view" class="px-9 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
        </NuxtLink>
        </div>
    </form>
    </div>
</template>