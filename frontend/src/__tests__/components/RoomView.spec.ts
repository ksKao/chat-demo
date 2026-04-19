import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import RoomView from '@/components/RoomView.vue'
import type { Message } from '@/lib/schemas'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } }),
}))

vi.mock('@/lib/queries/message.query', () => ({
  useMessages: vi.fn(),
  useSendMessage: vi.fn(),
}))

vi.mock('@/lib/queries/room.query', () => ({
  useClearUnreads: vi.fn(),
}))

import { useMessages, useSendMessage } from '@/lib/queries/message.query'
import { useClearUnreads } from '@/lib/queries/room.query'

const mockMessages: Message[] = [
  { id: 1, roomId: 1, senderUsername: 'alice', content: 'Hello', createdAt: new Date() },
  { id: 2, roomId: 1, senderUsername: 'bob', content: 'Hi there', createdAt: new Date() },
]

describe('RoomView', () => {
  beforeEach(() => {
    vi.mocked(useMessages).mockReturnValue({
      data: ref(mockMessages),
      isLoading: ref(false),
      error: ref(null),
    } as ReturnType<typeof useMessages>)
    vi.mocked(useSendMessage).mockReturnValue({
      mutate: vi.fn(),
      isPending: ref(false),
    } as unknown as ReturnType<typeof useSendMessage>)
    vi.mocked(useClearUnreads).mockReturnValue({ mutate: vi.fn() } as unknown as ReturnType<
      typeof useClearUnreads
    >)
  })

  it('renders a ChatMessage for each message', () => {
    const wrapper = shallowMount(RoomView)
    expect(wrapper.findAll('chat-message-stub').length).toBe(2)
  })

  it('shows "No messages" when message list is empty', () => {
    vi.mocked(useMessages).mockReturnValue({
      data: ref([]),
      isLoading: ref(false),
      error: ref(null),
    } as unknown as ReturnType<typeof useMessages>)
    const wrapper = shallowMount(RoomView)
    expect(wrapper.text()).toContain('No messages')
  })

  it('disables send input while mutation is pending', () => {
    vi.mocked(useSendMessage).mockReturnValue({
      mutate: vi.fn(),
      isPending: ref(true),
    } as unknown as ReturnType<typeof useSendMessage>)
    const wrapper = shallowMount(RoomView)
    expect(wrapper.find('input-stub').attributes('disabled')).toBe('true')
  })

  it('disables send button while mutation is pending', () => {
    vi.mocked(useSendMessage).mockReturnValue({
      mutate: vi.fn(),
      isPending: ref(true),
    } as unknown as ReturnType<typeof useSendMessage>)
    const wrapper = shallowMount(RoomView)
    expect(wrapper.find('button-stub').attributes('disabled')).toBe('true')
  })

  it('calls clearUnreads on mount for the current room', () => {
    const mutate = vi.fn()
    vi.mocked(useClearUnreads).mockReturnValue({ mutate } as unknown as ReturnType<
      typeof useClearUnreads
    >)
    shallowMount(RoomView)
    expect(mutate).toHaveBeenCalledWith(1)
  })
})
