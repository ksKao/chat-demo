import { computed, unref, type MaybeRef } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
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

export function useSendMessage(roomId: MaybeRef<number>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      kyClient.post(`rooms/${unref(roomId)}/messages`, { json: { content } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.messages, unref(roomId)] }),
  })
}
