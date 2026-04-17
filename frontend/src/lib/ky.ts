import ky from 'ky'
import { useUsername } from './hooks'

export const kyClient = ky.create({
  prefix: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    'X-Username': useUsername().value,
  },
})
