import ky from 'ky'
import { username } from './global'

export const kyClient = ky.create({
  prefix: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    'X-Username': username.value,
  },
})
