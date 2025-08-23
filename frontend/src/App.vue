<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <NavBar />
    <main class="max-w-6xl mx-auto p-4">
      <RouterView />
    </main>
  </div>
  
</template>

<style scoped>
</style>
