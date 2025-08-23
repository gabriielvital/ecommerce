<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/api'

interface Produto { id: number; nome: string; preco: number; imagem: string }

const qc = useQueryClient()
const { data: produtos, isLoading, isError, error: produtosError } = useQuery({
  queryKey: ['admin-produtos'],
  queryFn: async () => {
    const { data } = await api.get<any[]>('/produtos')
    // Garante que preco seja número, mesmo que venha como string do backend (DECIMAL)
    return data.map((p) => ({ ...p, preco: Number(p.preco) })) as Produto[]
  },
  retry: false,
  refetchOnWindowFocus: false,
})

// Log simples quando produtos muda
watchEffect(() => {
  if (produtos?.value) {
    console.log('[AdminProdutos] produtos carregados:', produtos.value)
  }
  if (isError.value) {
    console.error('[AdminProdutos] erro ao carregar produtos:', (produtosError as any)?.message || produtosError)
  }
})

const form = ref<Partial<Produto>>({ nome: '', preco: 0, imagem: '' })
const editingId = ref<number | null>(null)
const saving = ref(false)
const error = ref('')

const criar = useMutation({
  mutationFn: async (payload: Partial<Produto>) => (await api.post('/produtos', payload)).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-produtos'] }),
})
const atualizar = useMutation({
  mutationFn: async ({ id, dados }: { id: number; dados: Partial<Produto> }) => (await api.put(`/produtos/${id}`, dados)).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-produtos'] }),
})
const remover = useMutation({
  mutationFn: async (id: number) => (await api.delete(`/produtos/${id}`)).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-produtos'] }),
  onError: (error: any) => {
    error.value = error?.response?.data?.message || 'Erro ao remover produto'
  }
})

function startEdit(p: Produto) {
  editingId.value = p.id
  form.value = { nome: p.nome, preco: p.preco, imagem: p.imagem }
}
function cancelEdit() {
  editingId.value = null
  form.value = { nome: '', preco: 0, imagem: '' }
}
async function submit() {
  saving.value = true
  error.value = ''
  try {
    if (editingId.value) {
      await atualizar.mutateAsync({ id: editingId.value, dados: form.value })
    } else {
      await criar.mutateAsync(form.value)
    }
    cancelEdit()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao salvar produto'
  } finally {
    saving.value = false
  }
}
async function deleteProduto(id: number) {
  if (!confirm('Remover este produto?')) return
  error.value = ''
  try {
    await remover.mutateAsync(id)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao remover produto'
  }
}

function formatPreco(v: number | string | undefined) {
  const n = Number(v)
  if (Number.isFinite(n)) return n.toFixed(2)
  return '0.00'
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-semibold mb-4">Admin - Produtos</h1>

    <div class="bg-white border rounded p-4 mb-6">
      <h2 class="font-medium mb-3">{{ editingId ? 'Editar produto' : 'Novo produto' }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input v-model="form.nome" placeholder="Nome" class="border rounded px-3 py-2" />
        <input v-model.number="form.preco" type="number" step="0.01" placeholder="Preço" class="border rounded px-3 py-2" />
        <input v-model="form.imagem" placeholder="URL da imagem" class="border rounded px-3 py-2" />
      </div>
      <div class="mt-3 flex gap-2">
        <button :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60" @click="submit">
          {{ saving ? 'Salvando...' : (editingId ? 'Salvar alterações' : 'Criar produto') }}
        </button>
        <button v-if="editingId" class="px-3 py-2 bg-gray-200 rounded" @click="cancelEdit">Cancelar</button>
        <span v-if="error" class="text-red-600">{{ error }}</span>
      </div>
    </div>

    <div>
      <h2 class="font-medium mb-2">Produtos</h2>
      <div v-if="isLoading">Carregando...</div>
      <div v-else-if="isError">Erro ao carregar.</div>
      <div v-else-if="!produtos || produtos.length === 0" class="text-gray-600">Nenhum produto cadastrado.</div>
      <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <li v-for="p in produtos" :key="p.id" class="bg-white border rounded p-3 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <img :src="p.imagem" :alt="p.nome" class="w-16 h-16 object-cover rounded" />
            <div>
              <div class="font-medium">{{ p.nome }}</div>
              <div class="text-sm text-gray-600">R$ {{ formatPreco(p.preco) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 bg-gray-200 rounded" @click="startEdit(p)">Editar</button>
            <button class="px-3 py-1.5 bg-red-600 text-white rounded" @click="deleteProduto(p.id)">Remover</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Debug leve: remova depois de resolver -->
    <div class="mt-6 text-xs text-gray-500">
      <div>Status: {{ isLoading ? 'loading' : (isError ? 'error' : 'success') }}</div>
      <div v-if="!isLoading && !isError">Qtd produtos: {{ produtos?.length || 0 }}</div>
    </div>
  </div>
  
</template>
