<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from './components/ui/button/Button.vue'

const message = ref<string | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8080/api/hello')
    const data = await res.json()
    message.value = data.message
  } catch {
    error.value = 'Failed to reach backend'
  }
})
</script>

<template>
  <h1>Chat Demo</h1>
  <p v-if="message">{{ message }}</p>
  <p v-else-if="error">{{ error }}</p>
  <p v-else>Loading...</p>
  <Button>Button</Button>
</template>

<style scoped></style>
