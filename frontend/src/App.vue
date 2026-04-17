<script setup lang="ts">
import SideBar from '@/components/SideBar.vue';
import TopBar from '@/components/TopBar.vue';
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

</script>

<template>
  <TopBar />
  <div class="grow flex">
    <SideBar />
    <main>

    </main>
  </div>
  <Toaster :position="'top-center'" rich-colors />
</template>

<style scoped></style>
