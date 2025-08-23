import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/produtos' },
  { path: '/login', component: () => import('../pages/Login.vue'), meta: { guestOnly: true } },
  { path: '/produtos', component: () => import('../pages/Produtos.vue') },
  { path: '/carrinho', component: () => import('../pages/Carrinho.vue') },
  { path: '/enderecos', component: () => import('../pages/Enderecos.vue'), meta: { requiresAuth: true } },
  { path: '/meus-pedidos', component: () => import('../pages/MeusPedidos.vue'), meta: { requiresAuth: true } },
  { path: '/admin/produtos', component: () => import('../pages/AdminProdutos.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/pedidos', component: () => import('../pages/AdminPedidos.vue'), meta: { requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { path: '/produtos' }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: '/produtos' }
  }
})

export default router
