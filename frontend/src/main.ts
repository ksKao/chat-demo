import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { toast } from 'vue-sonner'

const app = createApp(App)

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      mutations: {
        onError: (e: unknown) => {
          if (e instanceof Error) {
            toast.error(e.message)
          } else if (typeof e === 'object' && e && 'error' in e && typeof e.error === 'string') {
            toast.error(e.error)
          } else {
            toast.error('Something went wrong. Please try again later.')
          }
        },
      },
    },
  },
})
app.use(router)

app.mount('#app')
