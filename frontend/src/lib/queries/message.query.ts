import { computed, unref, type MaybeRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { kyClient } from '../ky'
import { z } from 'zod/v4'
import { messageSchema } from '../schemas'
import { queryKeys } from '../queryKeys'

export function useMessages(roomId: MaybeRef<number>) {
  return useQuery({
    queryKey: computed(() => [queryKeys.messages, unref(roomId)]),
    queryFn: () =>
      kyClient.get(`rooms/${unref(roomId)}/messages`).json(z.array(messageSchema)),
  })
}
