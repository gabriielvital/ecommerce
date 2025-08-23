<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth'

interface Endereco { id: number; rua: string; numero: string; bairro: string; complemento?: string; usuarioId?: number }

const auth = useAuthStore()
const qc = useQueryClient()
const usuarioId = computed(() => auth.userId)

const { data: enderecos, isLoading, isError } = useQuery({
  queryKey: ['enderecos', usuarioId],
  enabled: computed(() => !!usuarioId.value),
  queryFn: async () => {
    const id = usuarioId.value
    const { data } = await api.get<Endereco[]>(`/enderecos/usuario/${id}`)
    return data
  },
})

const form = ref<Partial<Endereco>>({ rua: '', numero: '', bairro: '', complemento: '' })
const editingId = ref<number | null>(null)
const saving = ref(false)
const error = ref('')

const criar = useMutation({
  mutationFn: async (payload: Partial<Endereco>) => (await api.post('/enderecos', payload)).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['enderecos'] }),
})
const atualizar = useMutation({
  mutationFn: async ({ id, dados }: { id: number; dados: Partial<Endereco> }) => (await api.put(`/enderecos/${id}`, dados)).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['enderecos'] }),
})
const remover = useMutation({
  mutationFn: async (id: number) => (await api.delete(`/enderecos/${id}`)).data,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['enderecos'] }),
})

function startEdit(e: Endereco) {
  editingId.value = e.id
  form.value = { rua: e.rua, numero: e.numero, bairro: e.bairro, complemento: e.complemento ?? '' }
}
function cancelEdit() {
  editingId.value = null
  form.value = { rua: '', numero: '', bairro: '', complemento: '' }
}
async function submit() {
  saving.value = true
  error.value = ''
  try {
    const payload = { ...form.value }
    if (!editingId.value) {
      // backend usa user do token, mas aceita usuarioId opcional; não enviaremos
      await criar.mutateAsync(payload)
    } else {
      await atualizar.mutateAsync({ id: editingId.value, dados: payload })
    }
    cancelEdit()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao salvar endereço'
  } finally {
    saving.value = false
  }
}
async function deleteEndereco(id: number) {
  if (!confirm('Remover este endereço?')) return
  await remover.mutateAsync(id)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-semibold mb-4">Meus Endereços</h1>

    <div class="bg-white border rounded p-4 mb-6">
      <h2 class="font-medium mb-3">{{ editingId ? 'Editar endereço' : 'Novo endereço' }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input v-model="form.rua" placeholder="Rua" class="border rounded px-3 py-2" />
        <input v-model="form.numero" placeholder="Número" class="border rounded px-3 py-2" />
        <input v-model="form.bairro" placeholder="Bairro" class="border rounded px-3 py-2" />
        <input v-model="form.complemento" placeholder="Complemento (opcional)" class="border rounded px-3 py-2" />
      </div>
      <div class="mt-3 flex gap-2">
        <button :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60" @click="submit">
          {{ saving ? 'Salvando...' : (editingId ? 'Salvar alterações' : 'Adicionar endereço') }}
        </button>
        <button v-if="editingId" class="px-3 py-2 bg-gray-200 rounded" @click="cancelEdit">Cancelar</button>
        <span v-if="error" class="text-red-600">{{ error }}</span>
      </div>
    </div>

    <div>
      <h2 class="font-medium mb-2">Endereços</h2>
      <div v-if="isLoading">Carregando...</div>
      <div v-else-if="isError">Erro ao carregar.</div>
      <ul v-else class="space-y-3">
        <li v-for="e in enderecos" :key="e.id" class="bg-white border rounded p-3 flex items-center justify-between">
          <div>
            <div class="font-medium">{{ e.rua }}, {{ e.numero }} - {{ e.bairro }}</div>
            <div v-if="e.complemento" class="text-sm text-gray-600">{{ e.complemento }}</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 bg-gray-200 rounded" @click="startEdit(e)">Editar</button>
            <button class="px-3 py-1.5 bg-red-600 text-white rounded" @click="deleteEndereco(e.id)">Remover</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
