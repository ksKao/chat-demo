import { useQuery } from '@tanstack/vue-query'
import { kyClient } from '../ky'

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      return await kyClient.get('rooms').json()
    },
  })
}
