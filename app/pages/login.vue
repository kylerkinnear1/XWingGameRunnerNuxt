<script setup lang="ts">
import { ref, computed } from "vue";
import { authClient } from "../auth-client";

const session = authClient.useSession();

// UI state
const mode = ref<"signIn" | "signUp">("signIn");
const isBusy = ref(false);
const message = ref<string | null>(null);

// form fields
const name = ref("");
const email = ref(""); // you can label this "Username (email)" in the UI
const password = ref("");
const rememberMe = ref(true);

const isAuthed = computed(() => !!session?.value.data);

async function signUpEmail() {
  message.value = null;
  isBusy.value = true;
  try {
    const { data, error } = await authClient.signUp.email({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      // callbackURL: "/", // optional
    });

    if (error) {
      message.value = error.message ?? null;
      return;
    }

    message.value = "Account created. You’re signed in.";
  } catch (e: any) {
    message.value = e?.message ?? "Sign up failed.";
  } finally {
    isBusy.value = false;
  }
}

async function signInEmail() {
  message.value = null;
  isBusy.value = true;
  try {
    const { data, error } = await authClient.signIn.email(
      {
        email: email.value.trim(),
        password: password.value,
        rememberMe: rememberMe.value,
        // callbackURL: "/", // optional
      },
      {
        onError: (ctx) => {
          // Example: requireEmailVerification flow
          if (ctx.error?.status === 403) {
            message.value = "Please verify your email address.";
            return;
          }
          message.value = ctx.error?.message ?? "Sign in failed.";
        },
      }
    );

    if (error) {
      message.value = error.message ?? null;
      return;
    }

    message.value = "Signed in.";
  } catch (e: any) {
    message.value = e?.message ?? "Sign in failed.";
  } finally {
    isBusy.value = false;
  }
}

async function signOut() {
  message.value = null;
  isBusy.value = true;
  try {
    await authClient.signOut();
  } catch (e: any) {
    message.value = e?.message ?? "Sign out failed.";
  } finally {
    isBusy.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pt-16 md:pt-24">
    <!-- Not signed in -->
    <div v-if="!isAuthed" class="w-full max-w-md">
      <div class="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-bold text-white">
            {{ mode === "signUp" ? "Create Account" : "Welcome Back" }}
          </h1>
          <p class="text-sm text-gray-400">
            {{ mode === "signUp" ? "Sign up to start playing" : "Sign in to continue" }}
          </p>
        </div>

        <!-- Google Sign In -->
        <button
          :disabled="isBusy"
          @click="() => authClient.signIn.social({ provider: 'google' })"
          class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-lg font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-gray-800 px-2 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <!-- Mode Toggle -->
        <div class="flex gap-2 p-1 bg-gray-700 rounded-lg">
          <button
            :disabled="isBusy"
            @click="mode = 'signIn'"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              mode === 'signIn'
                ? 'bg-gray-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            Sign in
          </button>
          <button
            :disabled="isBusy"
            @click="mode = 'signUp'"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              mode === 'signUp'
                ? 'bg-gray-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            Sign up
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="mode === 'signUp' ? signUpEmail() : signInEmail()" class="space-y-4">
          <div v-if="mode === 'signUp'" class="space-y-2">
            <label for="name" class="block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              id="name"
              v-model="name"
              autocomplete="name"
              type="text"
              required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="Enter your name"
            />
          </div>

          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="Enter your password"
            />
          </div>

          <div v-if="mode === 'signIn'" class="flex items-center">
            <input
              id="rememberMe"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-600 bg-gray-700 rounded"
            />
            <label for="rememberMe" class="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <!-- Message -->
          <div
            v-if="message"
            :class="[
              'p-3 rounded-lg text-sm',
              message.includes('failed') || message.includes('error') || message.includes('verify')
                ? 'bg-red-900/30 text-red-300 border border-red-700'
                : 'bg-green-900/30 text-green-300 border border-green-700'
            ]"
          >
            {{ message }}
          </div>

          <button
            :disabled="isBusy"
            type="submit"
            class="w-full py-3 px-4 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {{ isBusy ? "Please wait..." : mode === "signUp" ? "Create account" : "Sign in" }}
          </button>
        </form>
      </div>
    </div>

    <!-- Signed in -->
    <div v-else class="w-full max-w-md">
      <div class="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 space-y-6 text-center">
        <div class="space-y-4">
          <div class="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto border border-green-700">
            <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">Signed In</h2>
            <p class="text-sm text-gray-400 mt-1">{{ session?.data?.user?.email }}</p>
          </div>
        </div>
        <button
          :disabled="isBusy"
          @click="signOut"
          class="w-full py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>
