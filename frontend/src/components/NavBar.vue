<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

function onLogout() {
  auth.logout()
}
</script>

<template>
  <nav class="w-full bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <RouterLink to="/produtos" class="text-lg font-semibold">E-commerce</RouterLink>
        <RouterLink to="/produtos" class="text-sm text-gray-600 hover:text-gray-900">Produtos</RouterLink>
        <RouterLink to="/carrinho" class="text-sm text-gray-600 hover:text-gray-900">Carrinho</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/enderecos" class="text-sm text-gray-600 hover:text-gray-900">Endereços</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/meus-pedidos" class="text-sm text-gray-600 hover:text-gray-900">Meus Pedidos</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin/produtos" class="text-sm text-gray-600 hover:text-gray-900">Admin Produtos</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin/pedidos" class="text-sm text-gray-600 hover:text-gray-900">Admin Pedidos</RouterLink>
      </div>
      <div class="flex items-center gap-3">
        <template v-if="auth.isAuthenticated">
          <span class="text-sm text-gray-700">{{ auth.username }}</span>
          <button class="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200" @click="onLogout">Sair</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="px-3 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-black">Entrar</RouterLink>
        </template>
      </div>
    </div>
  </nav>
</template>
