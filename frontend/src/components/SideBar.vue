<script setup lang="ts">
import AddRoomButton from "@/components/AddRoomButton.vue";
import RoomActionDropdown from "@/components/RoomActionDropdown.vue";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useUsername } from "@/lib/hooks";
import { useRooms } from "@/lib/queries/room.query";
import type { Room } from "@/lib/schemas";
import { AlertCircleIcon } from "lucide-vue-next";
import { computed } from "vue";

const username = useUsername();
const { data, isLoading, error } = useRooms();

const rooms = computed(() => {
  const output: { dmRooms: Room[], groupRooms: Room[] } = { dmRooms: [], groupRooms: [] };

  if (!data.value) return output;

  for (const room of data.value) {
    if (room.isDm) output.dmRooms.push(room);
    else output.groupRooms.push(room);
  }

  return output;
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
              <RouterLink v-for="room in rooms.groupRooms" :to="`/rooms/${room.id}`" :key="room.id" class="h-0 w-0">
                <div
                  class="flex justify-between items-center p-2 hover:bg-primary rounded-md hover:text-primary-foreground h-12">
                  <span>
                    {{ room.name }}
                  </span>
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
                class="p-2 hover:bg-primary flex items-center rounded-md hover:text-primary-foreground h-12">
                {{ room.name }}
              </RouterLink>
            </template>
            <i v-else>No DMs</i>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </template>
  </aside>
</template>
