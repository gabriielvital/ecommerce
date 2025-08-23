import { defineStore } from 'pinia'
import { api } from '../lib/api'
import { useAuthStore } from './auth'

export interface Produto { id: number; nome: string; preco: number; imagem: string }
export interface CarrinhoItem { id: number; quantidade: number; produto: Produto }
export interface Carrinho { id: number; itens: CarrinhoItem[]; total?: number }

export const useCartStore = defineStore('cart', {
  state: () => ({
    carrinho: null as Carrinho | null,
    loading: false as boolean,
    error: '' as string,
    guestItems: [] as { produto: Produto; quantidade: number }[],
  }),
  getters: {
    items: (s) => {
      if (s.carrinho) return s.carrinho.itens
      // map guest items to CarrinhoItem-like
      return s.guestItems.map((g) => ({ id: g.produto.id, quantidade: g.quantidade, produto: g.produto }))
    },
    total: (s) => {
      if (s.carrinho)
        return (
          s.carrinho.total ??
          s.carrinho.itens.reduce((sum, it) => sum + it.quantidade * Number(it.produto?.preco ?? 0), 0)
        )
      return s.guestItems.reduce((sum, it) => sum + it.quantidade * Number(it.produto?.preco ?? 0), 0)
    },
  },
  actions: {
    async fetchCart() {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.get<Carrinho>('/carrinho')
        this.carrinho = data
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao carregar carrinho'
      } finally {
        this.loading = false
      }
    },
    async addItem(produtoOrId: number | Produto, quantidade = 1) {
      const auth = useAuthStore()
      if (auth.isAuthenticated) {
        const produtoId = typeof produtoOrId === 'number' ? produtoOrId : produtoOrId.id
        await api.post('/carrinho/itens', { produtoId, quantidade })
        await this.fetchCart()
      } else {
        const produto = typeof produtoOrId === 'number' ? ({ id: produtoOrId } as unknown as Produto) : produtoOrId
        const idx = this.guestItems.findIndex((i) => i.produto.id === produto.id)
        if (idx >= 0) this.guestItems[idx].quantidade += quantidade
        else this.guestItems.push({ produto, quantidade })
      }
    },
    async updateItem(id: number, quantidade: number) {
      const auth = useAuthStore()
      if (auth.isAuthenticated) {
        await api.put(`/carrinho/itens/${id}`, { quantidade })
        await this.fetchCart()
      } else {
        const idx = this.guestItems.findIndex((i) => i.produto.id === id)
        if (idx >= 0) this.guestItems[idx].quantidade = quantidade
      }
    },
    async removeItem(id: number) {
      const auth = useAuthStore()
      if (auth.isAuthenticated) {
        await api.delete(`/carrinho/itens/${id}`)
        await this.fetchCart()
      } else {
        this.guestItems = this.guestItems.filter((i) => i.produto.id !== id)
      }
    },
    async checkout(enderecoId: number) {
      const { data } = await api.post('/carrinho/checkout', { enderecoId })
      await this.fetchCart()
      return data
    },
    async checkoutGuest(payload: {
      itens: { produtoId: number; quantidade: number }[]
      nomeCliente: string
      telefone: string
      rua: string
      numero: string
      bairro: string
      complemento?: string
      formaPagamento: 'DINHEIRO' | 'CARTAO' | 'PIX'
      trocoPara?: number
    }) {
      const { data } = await api.post('/pedidos/guest', payload)
      // Limpa carrinho convidado
      this.guestItems = []
      return data
    },
  },
})
