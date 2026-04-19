import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.exists()).toBe(true)
  })
})
