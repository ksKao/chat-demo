import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { kyClient } from '../ky'
import { z } from 'zod/v4'
import { roomSchema } from '../schemas'
import { queryKeys } from '../queryKeys'

export function useRooms() {
  return useQuery({
    queryKey: [queryKeys.room],
    queryFn: async () => {
      return await kyClient.get('rooms').json(z.array(roomSchema))
    },
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
