<script setup lang="ts">
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EllipsisVerticalIcon } from 'lucide-vue-next';
import type { Room } from '@/lib/schemas';
import { useAddRoomMember, useDeleteRoom } from '@/lib/queries/room.query';
import { ref } from 'vue';

const props = defineProps<{ room: Room }>();

const showAddMember = ref(false);
const showDeleteConfirm = ref(false);
const usernameInput = ref('');

const { mutate: addMember, isPending: isAdding } = useAddRoomMember();
const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoom();

function openAddMember() {
  usernameInput.value = '';
  showAddMember.value = true;
}

function submitAddMember() {
  if (!usernameInput.value.trim()) return;
  addMember(
    { roomId: props.room.id, username: usernameInput.value.trim() },
    { onSuccess: () => { showAddMember.value = false; } },
  );
}

function confirmDelete() {
  deleteRoom(props.room.id, { onSuccess: () => { showDeleteConfirm.value = false; } });
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm">
        <EllipsisVerticalIcon />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click.prevent="openAddMember">Add Member</DropdownMenuItem>
      <DropdownMenuItem @click.prevent="showDeleteConfirm = true">Delete Room
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Add Member Modal -->
  <Dialog v-model:open="showAddMember">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Member to {{ room.name }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-2 py-2">
        <Label for="username">Username</Label>
        <Input id="username" v-model="usernameInput" placeholder="Enter username" @keydown.enter="submitAddMember" />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showAddMember = false">Cancel</Button>
        <Button @click="submitAddMember" :disabled="isAdding || !usernameInput.trim()">
          {{ isAdding ? 'Adding…' : 'Add' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete Confirmation Modal -->
  <Dialog v-model:open="showDeleteConfirm">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete "{{ room.name }}"?</DialogTitle>
      </DialogHeader>
      <p class="text-sm text-muted-foreground">This action cannot be undone.</p>
      <DialogFooter>
        <Button variant="outline" @click="showDeleteConfirm = false">Cancel</Button>
        <Button variant="destructive" @click="confirmDelete" :disabled="isDeleting">
          {{ isDeleting ? 'Deleting…' : 'Delete' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
