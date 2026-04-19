import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SideBar from '@/components/SideBar.vue'
import type { Room, Unread } from '@/lib/schemas'

const mockUsername = ref('alice')
vi.mock('@/lib/hooks', () => ({
  useUsername: () => mockUsername,
}))

vi.mock('@/lib/queries/room.query', () => ({
  useRooms: vi.fn(),
  useUnreads: vi.fn(),
}))

import { useRooms, useUnreads } from '@/lib/queries/room.query'

const mockRooms: Room[] = [
  { id: 1, name: 'general', isDm: false, creatorUsername: 'alice', createdAt: new Date() },
  { id: 2, name: 'bob', isDm: true, creatorUsername: 'alice', createdAt: new Date() },
]

// Reka UI accordion components need slot-rendering stubs; shallowMount's auto-stubs
// don't render slots for these due to how AccordionRoot wraps them internally.
const stubs = {
  Accordion: { template: '<div><slot /></div>' },
  AccordionItem: { template: '<div><slot /></div>' },
  AccordionContent: { template: '<div><slot /></div>' },
  AccordionTrigger: { template: '<button><slot /></button>' },
  RouterLink: { template: '<a><slot /></a>' },
  AddRoomButton: true,
  RoomActionDropdown: true,
  Spinner: true,
  Badge: { template: '<span class="badge"><slot /></span>' },
  Alert: { template: '<div><slot /></div>' },
  AlertTitle: { template: '<span><slot /></span>' },
  AlertCircleIcon: true,
}

describe('SideBar', () => {
  beforeEach(() => {
    mockUsername.value = 'alice'
    vi.mocked(useRooms).mockReturnValue({
      data: ref(mockRooms),
      isLoading: ref(false),
      error: ref(null),
    } as ReturnType<typeof useRooms>)
    vi.mocked(useUnreads).mockReturnValue({ data: ref<Unread[]>([]) } as unknown as ReturnType<
      typeof useUnreads
    >)
  })

  it('renders group room names', () => {
    const wrapper = mount(SideBar, { global: { stubs } })
    expect(wrapper.text()).toContain('general')
  })

  it('renders DM names', () => {
    const wrapper = mount(SideBar, { global: { stubs } })
    expect(wrapper.text()).toContain('bob')
  })

  it('shows unread count when unreads exist for a room', () => {
    vi.mocked(useUnreads).mockReturnValue({
      data: ref<Unread[]>([{ roomId: 1, unreadCount: 5 }]),
    } as ReturnType<typeof useUnreads>)
    const wrapper = mount(SideBar, { global: { stubs } })
    expect(wrapper.findAll('.badge').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('5')
  })

  it('does not render badges when there are no unreads', () => {
    const wrapper = mount(SideBar, { global: { stubs } })
    expect(wrapper.findAll('.badge').length).toBe(0)
  })

  it('shows "No Rooms" when group rooms list is empty', () => {
    vi.mocked(useRooms).mockReturnValue({
      data: ref<Room[]>([]),
      isLoading: ref(false),
      error: ref(null),
    } as ReturnType<typeof useRooms>)
    const wrapper = mount(SideBar, { global: { stubs } })
    expect(wrapper.text()).toContain('No Rooms')
  })

  it('shows "No DMs" when DM list is empty', () => {
    vi.mocked(useRooms).mockReturnValue({
      data: ref<Room[]>([
        { id: 1, name: 'general', isDm: false, creatorUsername: 'alice', createdAt: new Date() },
      ]),
      isLoading: ref(false),
      error: ref(null),
    } as ReturnType<typeof useRooms>)
    const wrapper = mount(SideBar, { global: { stubs } })
    expect(wrapper.text()).toContain('No DMs')
  })

  describe('when username is empty', () => {
    beforeEach(() => {
      mockUsername.value = ''
    })

    it('shows set-username prompt', () => {
      const wrapper = mount(SideBar, { global: { stubs } })
      expect(wrapper.text()).toContain('Set your username')
    })

    it('does not show rooms or DMs', () => {
      const wrapper = mount(SideBar, { global: { stubs } })
      expect(wrapper.text()).not.toContain('general')
      expect(wrapper.text()).not.toContain('Rooms')
      expect(wrapper.text()).not.toContain('DMs')
    })

    it('calls useRooms with enabled: false', () => {
      mount(SideBar, { global: { stubs } })
      const calls = vi.mocked(useRooms).mock.calls
      const call = calls[calls.length - 1]?.[0]
      expect(call?.enabled?.value).toBe(false)
    })

    it('calls useUnreads with enabled: false', () => {
      mount(SideBar, { global: { stubs } })
      const calls = vi.mocked(useUnreads).mock.calls
      const call = calls[calls.length - 1]?.[0]
      expect(call?.enabled?.value).toBe(false)
    })
  })
})
