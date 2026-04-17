<script setup lang="ts">
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useMessages } from '@/lib/queries/message.query'
import { AlertCircleIcon } from "lucide-vue-next"
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomId = computed(() => Number(route.params.id))
const { data, isLoading, error } = useMessages(roomId)
</script>

<template>
  <div class="p-4 h-full">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <Spinner />
    </div>
    <p v-else-if="error" class="flex items-center justify-center h-full">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{{ error.message }}</AlertTitle>
      </Alert>
    </p>
    <pre v-else>{{ JSON.stringify(data, null, 2) }}</pre>
  </div>
</template>
