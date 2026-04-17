<script setup lang="ts">
import ModeToggle from "@/components/ModeToggle.vue";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUsername } from "@/lib/hooks";

const username = useUsername();

</script>

<template>
  <nav class="flex justify-end p-4 border-b border-b-border gap-4">
    <ModeToggle />
    <Dialog>
      <DialogTrigger as-child>
        <button class="relative cursor-pointer">
          <Avatar>
            <AvatarFallback>{{ username[0]?.toUpperCase() || "?" }}</AvatarFallback>
          </Avatar>
          <Badge v-if="!username" variant="destructive" class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2">
            !
          </Badge>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update username</DialogTitle>
          <DialogDescription class="sr-only">Update username</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input placeholder="Username" v-model="username" />
        </Field>
      </DialogContent>
    </Dialog>
  </nav>
</template>
