import { z } from 'zod/v4'

export const roomSchema = z.object({
  id: z.number(),
  isDm: z.boolean(),
  creatorUsername: z.string(),
  createdAt: z.coerce.date(),
  name: z.string(),
})

export type Room = z.infer<typeof roomSchema>

export const unreadSchema = z.object({
  roomId: z.number(),
  unreadCount: z.number(),
})

export type Unread = z.infer<typeof unreadSchema>

export const messageSchema = z.object({
  id: z.number(),
  roomId: z.number(),
  senderUsername: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
})

export type Message = z.infer<typeof messageSchema>
