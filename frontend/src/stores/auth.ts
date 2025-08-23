import { defineStore } from 'pinia'
import { api } from '../lib/api'

function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: (localStorage.getItem('token') || '') as string,
    role: (localStorage.getItem('role') || '') as string,
    username: (localStorage.getItem('username') || '') as string,
    userId: Number(localStorage.getItem('userId') || 0) as number,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    isAdmin: (s) => (s.role || '').toUpperCase() === 'ADMIN',
  },
  actions: {
    async login(username: string, password: string) {
      const { data } = await api.post('/auth/login', { username, password })
      const token = data?.access_token as string
      this.token = token
      localStorage.setItem('token', token)
      // try to read role and username from token
      const decoded = decodeJwt(token)
      const role = (decoded?.role || '').toString().toUpperCase()
      const uname = decoded?.username || username
      const uid = Number(decoded?.sub || 0)
      this.role = role
      this.username = uname
      this.userId = uid
      localStorage.setItem('role', role)
      localStorage.setItem('username', uname)
      localStorage.setItem('userId', String(uid))
    },
    logout() {
      this.token = ''
      this.role = ''
      this.username = ''
      this.userId = 0
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      localStorage.removeItem('userId')
    },
  },
})
