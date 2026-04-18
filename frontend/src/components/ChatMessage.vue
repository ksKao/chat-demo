<script setup lang="ts">
import { useUsername } from '@/lib/hooks';
import type { Message } from '@/lib/schemas';

const props = defineProps<{ message: Message }>();
const username = useUsername();
</script>

<template>
  <div
    :class="`w-full p-4 rounded-md ${props.message.senderUsername !== username ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`">
    <div class="flex justify-between items-center">
      <b>{{ props.message.senderUsername }}</b>
      <i class="text-muted-foreground">{{ props.message.createdAt.toDateString() }}
        {{ props.message.createdAt.toLocaleTimeString() }}
      </i>
    </div>
    <p>
      {{ props.message.content }}
    </p>
  </div>
</template>
