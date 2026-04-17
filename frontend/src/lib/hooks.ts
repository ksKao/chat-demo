import { useLocalStorage } from '@vueuse/core'

export function useUsername() {
  return useLocalStorage('username', '')
}
