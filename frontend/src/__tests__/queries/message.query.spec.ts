import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import type { ResponsePromise } from 'ky'
import { useMessages, useSendMessage } from '@/lib/queries/message.query'
import { queryKeys } from '@/lib/queryKeys'

vi.mock('@/lib/ky', () => ({
  kyClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { kyClient } from '@/lib/ky'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const queryPlugin: [typeof VueQueryPlugin, { queryClient: QueryClient }] = [VueQueryPlugin, { queryClient }]
  return {
    global: { plugins: [queryPlugin] },
    queryClient,
  }
}

function withSetup<T>(composable: () => T) {
  let result: T
  const { global, queryClient } = createWrapper()
  const app = mount(
    { setup() { result = composable(); return () => {} }, template: '<div />' },
    { global },
  )
  return { result: result!, queryClient, app }
}

describe('useMessages', () => {
  beforeEach(() => {
    vi.mocked(kyClient.get).mockReturnValue({ json: vi.fn().mockResolvedValue([]) } as unknown as ResponsePromise)
  })

  it('calls GET rooms/:id/messages', async () => {
    withSetup(() => useMessages(7))
    await flushPromises()
    expect(kyClient.get).toHaveBeenCalledWith('rooms/7/messages')
  })
})

describe('useSendMessage', () => {
  beforeEach(() => {
    vi.mocked(kyClient.post).mockResolvedValue(new Response())
  })

  it('calls POST rooms/:id/messages with content', async () => {
    const { result } = withSetup(() => useSendMessage(3))
    result.mutate('hey there')
    await flushPromises()
    expect(kyClient.post).toHaveBeenCalledWith('rooms/3/messages', { json: { content: 'hey there' } })
  })

  it('invalidates messages query for the room on success', async () => {
    const { result, queryClient } = withSetup(() => useSendMessage(3))
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    result.mutate('hey there')
    await flushPromises()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [queryKeys.messages, 3] })
  })
})
