import ky, { HTTPError } from 'ky'
import { useUsername } from './hooks'

const username = useUsername()

export const kyClient = ky.create({
  prefix: `${import.meta.env.VITE_BACKEND_URL}/api`,
  hooks: {
    beforeRequest: [
      (request) => {
        request.request.headers.set('X-Username', username.value)
      },
    ],
    beforeError: [
      async ({ error }) => {
        if (error instanceof HTTPError) {
          try {
            const body = error.data as { error?: string }
            if (body?.error) error.message = body.error
          } catch {
            // keep original message if body isn't JSON
          }
        }
        return error
      },
    ],
  },
})
