<script setup lang="ts">
    import { ref, computed } from "vue"
    import { authClient } from "../auth-client"
    
    const session = authClient.useSession()
    
    // UI state
    const mode = ref<"signIn" | "signUp">("signIn")
    const isBusy = ref(false)
    const message = ref<string | null>(null)
    
    // form fields
    const name = ref("")
    const email = ref("")        // you can label this "Username (email)" in the UI
    const password = ref("")
    const rememberMe = ref(true)
    
    const isAuthed = computed(() => !!session?.value.data)
    
    async function signUpEmail() {
      message.value = null
      isBusy.value = true
      try {
        const { data, error } = await authClient.signUp.email({
          name: name.value.trim(),
          email: email.value.trim(),
          password: password.value,
          // callbackURL: "/", // optional
        })
    
        if (error) {
          message.value = error.message ?? null
          return
        }
    
        message.value = "Account created. You’re signed in."
      } catch (e: any) {
        message.value = e?.message ?? "Sign up failed."
      } finally {
        isBusy.value = false
      }
    }
    
    async function signInEmail() {
      message.value = null
      isBusy.value = true
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
                message.value = "Please verify your email address."
                return
              }
              message.value = ctx.error?.message ?? "Sign in failed."
            },
          }
        )
    
        if (error) {
          message.value = error.message ?? null
          return
        }
    
        message.value = "Signed in."
      } catch (e: any) {
        message.value = e?.message ?? "Sign in failed."
      } finally {
        isBusy.value = false
      }
    }
    
    async function signOut() {
      message.value = null
      isBusy.value = true
      try {
        await authClient.signOut()
      } catch (e: any) {
        message.value = e?.message ?? "Sign out failed."
      } finally {
        isBusy.value = false
      }
    }
    </script>
    
    <template>
      <div>
        <!-- Not signed in -->
        <div v-if="!isAuthed">
          <button
            :disabled="isBusy"
            @click="() => authClient.signIn.social({ provider: 'google' })"
          >
            Continue with Google
          </button>
    
          <hr style="margin: 12px 0;" />
    
          <div style="display:flex; gap:8px; margin-bottom: 12px;">
            <button :disabled="isBusy" @click="mode = 'signIn'">Sign in</button>
            <button :disabled="isBusy" @click="mode = 'signUp'">Sign up</button>
          </div>
    
          <form @submit.prevent="mode === 'signUp' ? signUpEmail() : signInEmail()">
            <div v-if="mode === 'signUp'" style="margin-bottom: 8px;">
              <label>
                Name
                <input v-model="name" autocomplete="name" />
              </label>
            </div>
    
            <div style="margin-bottom: 8px;">
              <label>
                Username (email)
                <input v-model="email" type="email" autocomplete="email" />
              </label>
            </div>
    
            <div style="margin-bottom: 8px;">
              <label>
                Password
                <input v-model="password" type="password" autocomplete="current-password" />
              </label>
            </div>
    
            <div v-if="mode === 'signIn'" style="margin-bottom: 8px;">
              <label style="display:flex; gap:8px; align-items:center;">
                <input v-model="rememberMe" type="checkbox" />
                Remember me
              </label>
            </div>
    
            <button :disabled="isBusy" type="submit">
              {{ mode === 'signUp' ? 'Create account' : 'Sign in' }}
            </button>
    
            <p v-if="message" style="margin-top: 10px;">
              {{ message }}
            </p>
          </form>
        </div>
    
        <!-- Signed in -->
        <div v-else>
          <pre>{{ session.data }}</pre>
          <button :disabled="isBusy" @click="signOut">
            Sign out
          </button>
        </div>
      </div>
    </template>
    