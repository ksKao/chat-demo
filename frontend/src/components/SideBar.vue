<script setup lang="ts">
import AddRoomButton from "@/components/AddRoomButton.vue";
import RoomActionDropdown from "@/components/RoomActionDropdown.vue";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useUsername } from "@/lib/hooks";
import { useRooms, useUnreads } from "@/lib/queries/room.query";
import type { Room } from "@/lib/schemas";
import { AlertCircleIcon } from "lucide-vue-next";
import { computed } from "vue";

const username = useUsername();
const { data, isLoading, error } = useRooms();
const { data: unreadsData } = useUnreads();

const rooms = computed(() => {
  const output: { dmRooms: Room[], groupRooms: Room[] } = { dmRooms: [], groupRooms: [] };

  if (!data.value) return output;

  for (const room of data.value) {
    if (room.isDm) output.dmRooms.push(room);
    else output.groupRooms.push(room);
  }

  return output;
})

const unreadMap = computed(() => {
  const map: Record<number, number> = {};
  for (const u of unreadsData.value ?? []) {
    map[u.roomId] = u.unreadCount;
  }
  return map;
})
</script>

<template>
  <aside class="border-r border-r-border h-full p-4 w-64">
    <div v-if="isLoading" class="flex w-full h-full items-center justify-center">
      <Spinner />
    </div>
    <div v-else-if="error" class="flex w-full h-full items-center justify-center">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{{ error.message }}</AlertTitle>
      </Alert>
    </div>
    <template v-else>
      <Accordion type="multiple" :default-value="['group', 'dm']">
        <AccordionItem value="group">
          <div class="flex items-center gap-4">
            <AddRoomButton type="group" />
            <div class="grow">
              <AccordionTrigger>Rooms</AccordionTrigger>
            </div>
          </div>
          <AccordionContent>
            <template v-if="rooms.groupRooms.length">
              <RouterLink v-for="room in rooms.groupRooms" :to="`/rooms/${room.id}`" :key="room.id" class="h-0 w-0 group">
                <div
                  class="flex justify-between items-center p-2 hover:bg-secondary rounded-md hover:text-secondary-foreground h-12 mb-2 group-[.router-link-active]:bg-primary group-[.router-link-active]:text-primary-foreground group-[.router-link-active]:hover:bg-primary">
                  <span>
                    {{ room.name }}
                  </span>
                  <Badge v-if="unreadMap[room.id]" class="ml-auto mr-1">{{ unreadMap[room.id] }}</Badge>
                  <RoomActionDropdown v-if="room.creatorUsername === username" :room="room" />
                </div>
              </RouterLink>
            </template>
            <i v-else>No Rooms</i>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="dm">
          <div class="flex items-center gap-4">
            <AddRoomButton type="dm" />
            <div class="grow">
              <AccordionTrigger>DMs</AccordionTrigger>
            </div>
          </div>
          <AccordionContent>
            <template v-if="rooms.dmRooms.length">
              <RouterLink v-for="room in rooms.dmRooms" :to="`/rooms/${room.id}`" :key="room.id"
                class="p-2 hover:bg-secondary flex items-center rounded-md hover:text-secondary-foreground h-12 mb-2 [&.router-link-active]:bg-primary [&.router-link-active]:text-primary-foreground [&.router-link-active]:hover:bg-primary">
                {{ room.name }}
                <Badge v-if="unreadMap[room.id]" class="ml-auto">{{ unreadMap[room.id] }}</Badge>
              </RouterLink>
            </template>
            <i v-else>No DMs</i>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </template>
  </aside>
</template>
