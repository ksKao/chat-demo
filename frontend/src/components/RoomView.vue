<script setup lang="ts">
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useMessages, useSendMessage } from '@/lib/queries/message.query'
import { AlertCircleIcon, SendIcon } from "lucide-vue-next"
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ChatMessage from "@/components/ChatMessage.vue"

const route = useRoute()
const roomId = computed(() => Number(route.params.id))
const { data, isLoading, error } = useMessages(roomId)
const { mutate: sendMessage, isPending } = useSendMessage(roomId)

const content = ref('')
const inputRef = ref<{ $el: HTMLInputElement } | null>(null)
const scrollRef = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
  const el = scrollRef.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(data, async () => {
  await nextTick()
  scrollToBottom()
})

function handleSend() {
  if (!content.value.trim()) return
  sendMessage(content.value.trim(), {
    onSuccess: async () => {
      content.value = ''
      await nextTick()
      inputRef.value?.$el?.focus()
      scrollToBottom()
    },
  })
}
</script>

<template>
  <div class="p-4 grow flex flex-col min-h-0">
    <div v-if="isLoading" class="flex items-center justify-center grow">
      <Spinner />
    </div>
    <p v-else-if="error" class="flex items-center justify-center grow">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{{ error.message }}</AlertTitle>
      </Alert>
    </p>
    <div v-else class="flex flex-col grow gap-4 min-h-0">
      <div ref="scrollRef" class="flex flex-col gap-4 overflow-y-auto grow min-h-0">
        <ChatMessage v-for="message in data" :key="message.id" :message="message" />
      </div>
      <form @submit.prevent="handleSend" class="flex gap-2">
        <Input ref="inputRef" v-model="content" placeholder="Message..." :disabled="isPending" class="flex-1" />
        <Button type="submit" :disabled="isPending || !content.trim()">
          <SendIcon />
        </Button>
      </form>
    </div>
  </div>
</template>
