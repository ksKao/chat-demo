import { createRouter, createWebHistory } from 'vue-router'
import ChatLayout from '@/layouts/ChatLayout.vue'
import RoomView from '@/components/RoomView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ChatLayout,
      children: [
        { path: 'rooms/:id', component: RoomView },
      ],
    },
  ],
})

export default router
