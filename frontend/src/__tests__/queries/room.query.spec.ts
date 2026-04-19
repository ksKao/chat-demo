import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import type { ResponsePromise } from 'ky'
import { useRooms, useCreateRoom, useDeleteRoom, useCreateDm, useUnreads } from '@/lib/queries/room.query'
import { queryKeys } from '@/lib/queryKeys'

vi.mock('@/lib/ky', () => ({
  kyClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
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

describe('useRooms', () => {
  beforeEach(() => {
    vi.mocked(kyClient.get).mockReturnValue({ json: vi.fn().mockResolvedValue([]) } as unknown as ResponsePromise)
  })

  it('calls GET rooms', async () => {
    withSetup(() => useRooms())
    await flushPromises()
    expect(kyClient.get).toHaveBeenCalledWith('rooms')
  })
})

describe('useCreateRoom', () => {
  beforeEach(() => {
    vi.mocked(kyClient.post).mockResolvedValue(new Response())
  })

  it('calls POST rooms with name', async () => {
    const { result } = withSetup(() => useCreateRoom())
    result.mutate('general')
    await flushPromises()
    expect(kyClient.post).toHaveBeenCalledWith('rooms', { json: { name: 'general' } })
  })

  it('invalidates rooms query on success', async () => {
    const { result, queryClient } = withSetup(() => useCreateRoom())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    result.mutate('general')
    await flushPromises()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [queryKeys.room] })
  })
})

describe('useDeleteRoom', () => {
  beforeEach(() => {
    vi.mocked(kyClient.delete).mockResolvedValue(new Response())
  })

  it('calls DELETE rooms/:id', async () => {
    const { result } = withSetup(() => useDeleteRoom())
    result.mutate(42)
    await flushPromises()
    expect(kyClient.delete).toHaveBeenCalledWith('rooms/42')
  })

  it('invalidates rooms query on success', async () => {
    const { result, queryClient } = withSetup(() => useDeleteRoom())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    result.mutate(42)
    await flushPromises()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [queryKeys.room] })
  })
})

describe('useCreateDm', () => {
  beforeEach(() => {
    vi.mocked(kyClient.post).mockResolvedValue(new Response())
  })

  it('calls POST rooms/dm with other_username', async () => {
    const { result } = withSetup(() => useCreateDm())
    result.mutate('bob')
    await flushPromises()
    expect(kyClient.post).toHaveBeenCalledWith('rooms/dm', { json: { other_username: 'bob' } })
  })
})

describe('useUnreads', () => {
  beforeEach(() => {
    vi.mocked(kyClient.get).mockReturnValue({ json: vi.fn().mockResolvedValue([]) } as unknown as ResponsePromise)
  })

  it('calls GET unreads', async () => {
    withSetup(() => useUnreads())
    await flushPromises()
    expect(kyClient.get).toHaveBeenCalledWith('unreads')
  })

  it('re-fetches after 5 seconds', async () => {
    vi.useFakeTimers()
    withSetup(() => useUnreads())
    await flushPromises()
    const callCount = vi.mocked(kyClient.get).mock.calls.length
    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(vi.mocked(kyClient.get).mock.calls.length).toBeGreaterThan(callCount)
    vi.useRealTimers()
  })
})
