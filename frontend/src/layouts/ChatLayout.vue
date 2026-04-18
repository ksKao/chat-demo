<script setup lang="ts">
import SideBar from '@/components/SideBar.vue'
import TopBar from '@/components/TopBar.vue'
</script>

<template>
  <div class="h-svh flex flex-col">
    <TopBar />
    <div class="flex grow overflow-hidden">
      <SideBar />
      <main class="grow flex flex-col overflow-hidden">
        <RouterView />
      </main>
    </div>
  </div>
</template>
