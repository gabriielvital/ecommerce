<script setup lang="ts">
import { ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/api'

type PedidoStatus = 'PENDENTE' | 'PREPARANDO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO'
interface Usuario { id: number; username: string }
interface Endereco { id: number; rua: string; numero: string; bairro: string }
interface PedidoProduto { id: number; quantidade: number; produto: { id: number; nome: string; preco: number } }
interface Pedido { id: number; status: PedidoStatus; total: number; usuario: Usuario | null; endereco: Endereco | null; pedidoProdutos: PedidoProduto[]; rua?: string; numero?: string; bairro?: string }

const STATUSES: PedidoStatus[] = ['PENDENTE', 'PREPARANDO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']

const qc = useQueryClient()
const { data: pedidos, isLoading, isError } = useQuery({
  queryKey: ['admin-pedidos'],
  queryFn: async () => (await api.get<Pedido[]>('/pedidos')).data,
})

const updatingId = ref<number | null>(null)
const error = ref('')

const updateStatus = useMutation({
  mutationFn: async ({ id, status }: { id: number; status: PedidoStatus }) => (await api.put(`/pedidos/${id}/status`, { status })).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-pedidos'] }),
})

const removePedido = useMutation({
  mutationFn: async (id: number) => (await api.delete(`/pedidos/${id}`)).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-pedidos'] }),
})

async function changeStatus(id: number, status: PedidoStatus) {
  updatingId.value = id
  error.value = ''
  try {
    await updateStatus.mutateAsync({ id, status })
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao atualizar status'
  } finally {
    updatingId.value = null
  }
}

async function deletePedido(id: number) {
  if (!confirm('Excluir este pedido?')) return
  await removePedido.mutateAsync(id)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-semibold mb-4">Admin - Pedidos</h1>

    <div v-if="isLoading">Carregando...</div>
    <div v-else-if="isError">Erro ao carregar pedidos.</div>
    <div v-else>
      <ul class="space-y-4">
        <li v-for="p in pedidos" :key="p.id" class="bg-white border rounded p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold">Pedido #{{ p.id }} - {{ p.usuario?.username ?? 'usuário' }}</div>
              <div class="text-sm text-gray-600">
                <!-- Exibe endereço formal se houver, senão usa os campos do pedido (guest) -->
                <template v-if="p.endereco">
                  Endereço: {{ p.endereco.rua }}, {{ p.endereco.numero }} - {{ p.endereco.bairro }}
                </template>
                <template v-else>
                  Endereço: {{ p.rua || '-' }}, {{ p.numero || '-' }} - {{ p.bairro || '-' }}
                </template>
              </div>
              <div class="text-sm text-gray-600">Total: R$ {{ Number(p.total).toFixed(2) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <select :disabled="updatingId === p.id" class="border rounded px-2 py-1" :value="p.status" @change="changeStatus(p.id, ($event.target as HTMLSelectElement).value as PedidoStatus)">
                <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
              </select>
              <button class="px-3 py-1.5 bg-red-600 text-white rounded" @click="deletePedido(p.id)">Excluir</button>
            </div>
          </div>

          <div class="mt-3">
            <div class="text-sm text-gray-700 font-medium mb-1">Itens</div>
            <ul class="text-sm text-gray-700 list-disc pl-5">
              <li v-for="pp in p.pedidoProdutos" :key="pp.id">
                {{ pp.quantidade }}x {{ pp.produto?.nome }} — R$ {{ (pp.quantidade * (pp.produto?.preco ?? 0)).toFixed(2) }}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>

    <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
  </div>
</template>
