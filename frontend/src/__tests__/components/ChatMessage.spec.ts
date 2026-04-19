import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatMessage from '@/components/ChatMessage.vue'
import type { Message } from '@/lib/schemas'

vi.mock('@/lib/hooks', () => ({
  useUsername: () => ref('alice'),
}))

const message: Message = {
  id: 1,
  roomId: 1,
  senderUsername: 'alice',
  content: 'Hello world',
  createdAt: new Date('2024-01-01'),
}

describe('ChatMessage', () => {
  it('renders sender username', () => {
    const wrapper = mount(ChatMessage, { props: { message } })
    expect(wrapper.text()).toContain('alice')
  })

  it('renders message content', () => {
    const wrapper = mount(ChatMessage, { props: { message } })
    expect(wrapper.text()).toContain('Hello world')
  })

  it('applies primary style for own messages', () => {
    const wrapper = mount(ChatMessage, { props: { message } })
    expect(wrapper.find('div').classes()).toContain('bg-primary')
  })

  it("applies secondary style for others' messages", () => {
    const otherMessage = { ...message, senderUsername: 'bob' }
    const wrapper = mount(ChatMessage, { props: { message: otherMessage } })
    expect(wrapper.find('div').classes()).toContain('bg-secondary')
  })
})
