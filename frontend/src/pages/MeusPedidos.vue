<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

type PedidoStatus = 'PENDENTE' | 'PREPARANDO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO'
interface PedidoProduto { id: number; quantidade: number; produto?: { nome: string; preco: number } }
interface Pedido { id: number; status: PedidoStatus; total?: number; createdAt?: string; pedidoProdutos?: PedidoProduto[] }

const { data, isLoading, isError } = useQuery({
  queryKey: ['meus-pedidos', auth.userId],
  queryFn: async () => (await api.get<Pedido[]>(`/pedidos/usuario/${auth.userId}`)).data,
  enabled: !!auth.userId,
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-semibold mb-4">Meus Pedidos</h1>
    <div v-if="isLoading">Carregando...</div>
    <div v-else-if="isError">Erro ao carregar pedidos.</div>
    <div v-else>
      <ul class="space-y-2">
        <li v-for="p in data" :key="p.id" class="bg-white border rounded p-3">
          <div class="flex items-center justify-between">
            <span class="font-medium">#{{ p.id }}</span>
            <span class="text-sm text-gray-600">{{ p.status }}</span>
          </div>
          <div v-if="p.pedidoProdutos?.length" class="mt-2 text-sm text-gray-700">
            <ul class="list-disc pl-5">
              <li v-for="pp in p.pedidoProdutos" :key="pp.id">
                {{ pp.quantidade }}x {{ pp.produto?.nome || 'Produto' }}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
