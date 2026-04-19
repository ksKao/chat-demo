import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { kyClient } from '../ky'
import { z } from 'zod/v4'
import { roomSchema, unreadSchema } from '../schemas'
import { queryKeys } from '../queryKeys'

export function useRooms(options?: { enabled?: Ref<boolean> }) {
  return useQuery({
    queryKey: [queryKeys.room],
    queryFn: async () => {
      return await kyClient.get('rooms').json(z.array(roomSchema))
    },
    enabled: options?.enabled,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      kyClient.post('rooms', { json: { name } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.room] }),
  })
}

export function useCreateDm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (other_username: string) =>
      kyClient.post('rooms/dm', { json: { other_username } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.room] }),
  })
}

export function useAddRoomMember() {
  return useMutation({
    mutationFn: ({ roomId, username }: { roomId: number; username: string }) =>
      kyClient.post(`rooms/${roomId}/members`, { json: { username } }),
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => kyClient.delete(`rooms/${roomId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.room] }),
  })
}

export function useUnreads(options?: { enabled?: Ref<boolean> }) {
  return useQuery({
    queryKey: [queryKeys.unreads],
    queryFn: async () => kyClient.get('unreads').json(z.array(unreadSchema)),
    refetchInterval: 5000,
    enabled: options?.enabled,
  })
}

export function useClearUnreads() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => kyClient.delete(`rooms/${roomId}/unreads`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKeys.unreads] }),
  })
}
