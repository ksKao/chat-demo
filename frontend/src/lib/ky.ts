import ky, { HTTPError } from 'ky'
import { useUsername } from './hooks'

export const kyClient = ky.create({
  prefix: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    'X-Username': useUsername().value,
  },
  hooks: {
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
