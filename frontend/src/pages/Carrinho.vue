<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { api } from '../lib/api'

const cart = useCartStore()
const auth = useAuthStore()
const enderecoId = ref<number | null>(null)
// Guest checkout form
const nomeCliente = ref('')
const telefone = ref('')
const rua = ref('')
const numero = ref('')
const bairro = ref('')
const complemento = ref('')
const formaPagamento = ref<'DINHEIRO' | 'CARTAO' | 'PIX'>('DINHEIRO')
const trocoPara = ref<number | null>(null)
const checkingOut = ref(false)
const message = ref('')

onMounted(() => {
  if (auth.isAuthenticated) cart.fetchCart()
})

interface Endereco { id: number; rua: string; numero: string; bairro: string; complemento?: string }
const usuarioId = computed(() => auth.userId)
const { data: enderecos, isLoading: loadingEnderecos } = useQuery({
  queryKey: ['enderecos', usuarioId],
  enabled: computed(() => !!usuarioId.value),
  queryFn: async () => {
    const id = usuarioId.value
    const url = id ? `/enderecos/usuario/${id}` : '/enderecos'
    const { data } = await api.get<Endereco[]>(url)
    return data
  },
})

async function inc(itemId: number, quantidade: number) {
  await cart.updateItem(itemId, quantidade + 1)
}
async function dec(itemId: number, quantidade: number) {
  if (quantidade <= 1) return
  await cart.updateItem(itemId, quantidade - 1)
}
async function remove(itemId: number) {
  await cart.removeItem(itemId)
}
async function doCheckout() {
  checkingOut.value = true
  message.value = ''
  try {
    if (auth.isAuthenticated) {
      if (!enderecoId.value) {
        alert('Selecione um endereço')
        return
      }
      const pedido = await cart.checkout(enderecoId.value)
      message.value = `Pedido #${pedido?.id ?? ''} criado com sucesso!`
    } else {
      // Validate basic fields
      if (!nomeCliente.value || !telefone.value || !rua.value || !numero.value || !bairro.value) {
        alert('Preencha nome, telefone e endereço (rua, número, bairro).')
        return
      }
      const itens = cart.items.map((it) => ({ produtoId: it.produto.id, quantidade: it.quantidade }))
      const payload = {
        itens,
        nomeCliente: nomeCliente.value,
        telefone: telefone.value,
        rua: rua.value,
        numero: numero.value,
        bairro: bairro.value,
        complemento: complemento.value || undefined,
        formaPagamento: formaPagamento.value,
        trocoPara: formaPagamento.value === 'DINHEIRO' ? (trocoPara.value ?? undefined) : undefined,
      }
      const pedido = await cart.checkoutGuest(payload as any)
      // Reset form
      nomeCliente.value = ''
      telefone.value = ''
      rua.value = ''
      numero.value = ''
      bairro.value = ''
      complemento.value = ''
      formaPagamento.value = 'DINHEIRO'
      trocoPara.value = null
      message.value = `Pedido #${pedido?.id ?? ''} criado com sucesso!`
    }
  } catch (e: any) {
    message.value = e?.response?.data?.message || 'Erro ao finalizar compra'
  } finally {
    checkingOut.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-2xl font-semibold mb-4">Carrinho</h1>

    <div v-if="cart.loading">Carregando carrinho...</div>
    <div v-else-if="cart.error" class="text-red-600">{{ cart.error }}</div>
    <div v-else>
      <div v-if="cart.items.length === 0" class="text-gray-600">Seu carrinho está vazio.</div>
      <ul v-else class="space-y-3">
        <li v-for="it in cart.items" :key="it.id" class="bg-white border rounded p-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="it.produto?.imagem" :alt="it.produto?.nome" class="w-16 h-16 object-cover rounded" />
            <div>
              <div class="font-medium">{{ it.produto?.nome }}</div>
              <div class="text-sm text-gray-600">R$ {{ (it.produto?.preco ?? 0).toFixed(2) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-2 py-1 bg-gray-200 rounded" @click="dec(it.id, it.quantidade)">-</button>
            <span>{{ it.quantidade }}</span>
            <button class="px-2 py-1 bg-gray-200 rounded" @click="inc(it.id, it.quantidade)">+</button>
            <button class="ml-4 px-3 py-1.5 bg-red-600 text-white rounded" @click="remove(it.id)">Remover</button>
          </div>
        </li>
      </ul>

      <div v-if="cart.items.length > 0" class="mt-6 bg-white border rounded p-4">
        <!-- Authenticated: selecionar endereço salvo -->
        <div v-if="auth.isAuthenticated" class="flex items-center gap-3 mb-3">
          <label class="text-sm text-gray-700">Endereço:</label>
          <select v-model.number="enderecoId" class="border rounded px-2 py-1 min-w-64">
            <option :value="null" disabled>Selecione um endereço</option>
            <option v-for="e in enderecos" :key="e.id" :value="e.id">
              {{ e.rua }}, {{ e.numero }} - {{ e.bairro }} <span v-if="e.complemento">({{ e.complemento }})</span>
            </option>
          </select>
          <span v-if="loadingEnderecos" class="text-sm text-gray-500">Carregando endereços...</span>
        </div>

        <!-- Guest: formulário inline -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input v-model="nomeCliente" placeholder="Seu nome" class="border rounded px-3 py-2" />
          <input v-model="telefone" placeholder="Seu telefone" class="border rounded px-3 py-2" />
          <input v-model="rua" placeholder="Rua" class="border rounded px-3 py-2" />
          <input v-model="numero" placeholder="Número" class="border rounded px-3 py-2" />
          <input v-model="bairro" placeholder="Bairro" class="border rounded px-3 py-2" />
          <input v-model="complemento" placeholder="Complemento (opcional)" class="border rounded px-3 py-2" />
          <div class="col-span-1 md:col-span-2 flex items-center gap-3">
            <label class="text-sm text-gray-700">Forma de pagamento:</label>
            <select v-model="formaPagamento" class="border rounded px-2 py-1">
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO">Cartão</option>
              <option value="PIX">Pix</option>
            </select>
            <input v-if="formaPagamento === 'DINHEIRO'" v-model.number="trocoPara" type="number" min="0" step="0.01" placeholder="Troco para R$" class="border rounded px-3 py-2" />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-lg font-semibold">Total: R$ {{ cart.total.toFixed(2) }}</div>
          <button :disabled="checkingOut" class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60" @click="doCheckout">
            {{ checkingOut ? 'Finalizando...' : 'Finalizar compra' }}
          </button>
        </div>
        <p v-if="message" class="mt-3 text-sm" :class="message.includes('sucesso') ? 'text-green-700' : 'text-red-600'">{{ message }}</p>
      </div>
    </div>
  </div>
</template>
