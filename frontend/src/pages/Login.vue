<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/produtos'
    router.push(redirect)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Falha no login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16 bg-white p-6 rounded-lg shadow">
    <h1 class="text-xl font-semibold mb-4">Entrar</h1>
    <form @submit.prevent="submit" class="space-y-3">
      <div>
        <label class="block text-sm text-gray-700 mb-1">Usuário</label>
        <input v-model="username" class="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block text-sm text-gray-700 mb-1">Senha</label>
        <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button :disabled="loading" class="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>
