<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

</script>

<template>
  <h1>Chat Demo</h1>
  <Button>
    Button
  </Button>
  <Toaster :position="'top-center'" rich-colors />
</template>

<style scoped></style>
