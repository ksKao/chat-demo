<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useCreateDm, useCreateRoom } from '@/lib/queries/room.query';
import { PlusIcon } from 'lucide-vue-next';
import { ref, watch } from 'vue';

const props = defineProps<{ type: 'group' | 'dm' }>()

const open = ref(false)
const value = ref('')

const createRoom = useCreateRoom()
const createDm = useCreateDm()

const isPending = props.type === 'group' ? createRoom.isPending : createDm.isPending

watch(open, (val) => {
  if (val) value.value = ''
})

async function handleSubmit() {
  if (!value.value.trim()) return

  if (props.type === 'group') {
    await createRoom.mutateAsync(value.value.trim())
  } else {
    await createDm.mutateAsync(value.value.trim())
  }

  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button size="icon-sm" variant="outline">
        <PlusIcon />
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ type === 'group' ? 'Create Room' : 'New DM' }}</DialogTitle>
        <DialogDescription class="sr-only">{{ type === 'group' ? 'Create Room' : 'New DM' }}</DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <Input
          v-model="value"
          :placeholder="type === 'group' ? 'Room name' : 'Username'"
          :disabled="isPending"
          autofocus
        />
        <Button type="submit" :disabled="isPending || !value.trim()">
          <Spinner v-if="isPending" class="mr-2" />
          {{ type === 'group' ? 'Create' : 'Send' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
