<script setup lang="ts">
import SideBar from '@/components/SideBar.vue'
import TopBar from '@/components/TopBar.vue'
</script>

<template>
  <TopBar />
  <div class="grow flex">
    <SideBar />
    <main class="grow">
      <RouterView />
    </main>
  </div>
</template>
