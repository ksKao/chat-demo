import { useQuery } from '@tanstack/vue-query'
import { kyClient } from '../ky'
import { z } from 'zod/v4'
import { roomSchema } from '../schemas'

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      return await kyClient.get('rooms').json(z.array(roomSchema))
    },
  })
}
