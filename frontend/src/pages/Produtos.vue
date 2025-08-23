<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { api } from '../lib/api'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

interface Produto { id: number; nome: string; preco: number; imagem: string }

const { data, isLoading, isError } = useQuery({
  queryKey: ['produtos'],
  queryFn: async () => {
    const r = await api.get<any[]>('/produtos')
    return r.data.map((p) => ({ ...p, preco: Number(p.preco) })) as Produto[]
  },
})

const cart = useCartStore()
const auth = useAuthStore()

async function addToCart(p: Produto) {
  // Suporta convidados: envia o objeto produto para armazenar no carrinho local
  await cart.addItem(p, 1)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-semibold mb-4">Produtos</h1>
    <div v-if="isLoading">Carregando...</div>
    <div v-else-if="isError">Erro ao carregar produtos.</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="p in data" :key="p.id" class="bg-white border rounded-lg p-4 flex flex-col">
        <img :src="p.imagem" :alt="p.nome" class="w-full h-40 object-cover rounded" />
        <h2 class="mt-2 font-medium">{{ p.nome }}</h2>
        <p class="text-gray-700">R$ {{ p.preco.toFixed(2) }}</p>
        <button class="mt-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" @click="addToCart(p)">
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  </div>
</template>
