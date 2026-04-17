import { z } from 'zod/v4'

export const roomSchema = z.object({
  id: z.number(),
  isDm: z.boolean(),
  creatorUsername: z.string(),
  createdAt: z.coerce.date(),
  name: z.string(),
})

export type Room = z.infer<typeof roomSchema>
